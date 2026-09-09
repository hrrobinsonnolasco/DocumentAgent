#!/usr/bin/env bash
# Lanza (o reutiliza) una g5.xlarge. NO lo corras si no quieres gastar ~USD 1.20/h.
# Requiere: aws CLI autenticado (aws sts get-caller-identity).
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
TYPE="${INSTANCE_TYPE:-g5.xlarge}"
NAME="documentagent-poc"
KEY_NAME="${KEY_NAME:-documentagent-poc}"
SG_NAME="documentagent-poc-sg"

command -v aws >/dev/null || { echo "Instala AWS CLI v2 y autentícate (aws configure sso)."; exit 1; }
aws sts get-caller-identity --region "$REGION" >/dev/null

MY_IP="$(curl -s https://checkip.amazonaws.com)/32"
echo "Tu IP pública: $MY_IP  región: $REGION  tipo: $TYPE"

# AMI: Deep Learning OSS Nvidia Driver GPU PyTorch (Ubuntu), la más reciente
AMI="$(aws ec2 describe-images --region "$REGION" --owners amazon \
  --filters "Name=name,Values=Deep Learning OSS Nvidia Driver AMI GPU PyTorch *Ubuntu 22.04*" \
            "Name=state,Values=available" \
  --query 'sort_by(Images,&CreationDate)[-1].ImageId' --output text)"
echo "AMI: $AMI"

if ! aws ec2 describe-key-pairs --region "$REGION" --key-names "$KEY_NAME" >/dev/null 2>&1; then
  mkdir -p "$HOME/.ssh"
  aws ec2 create-key-pair --region "$REGION" --key-name "$KEY_NAME" --query 'KeyMaterial' --output text \
    > "$HOME/.ssh/${KEY_NAME}.pem"
  chmod 400 "$HOME/.ssh/${KEY_NAME}.pem"
  echo "Key nueva: ~/.ssh/${KEY_NAME}.pem"
fi

SG_ID="$(aws ec2 describe-security-groups --region "$REGION" --filters "Name=group-name,Values=$SG_NAME" \
  --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)"
if [[ -z "$SG_ID" || "$SG_ID" == "None" ]]; then
  VPC="$(aws ec2 describe-vpcs --region "$REGION" --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text)"
  SG_ID="$(aws ec2 create-security-group --region "$REGION" --group-name "$SG_NAME" \
    --description "DocumentAgent PoC SSH only" --vpc-id "$VPC" --query GroupId --output text)"
  aws ec2 authorize-security-group-ingress --region "$REGION" --group-id "$SG_ID" \
    --protocol tcp --port 22 --cidr "$MY_IP"
  echo "SG: $SG_ID (SSH solo desde $MY_IP)"
fi

EXISTING="$(aws ec2 describe-instances --region "$REGION" \
  --filters "Name=tag:Name,Values=$NAME" "Name=instance-state-name,Values=running,stopped,pending" \
  --query 'Reservations[0].Instances[0].InstanceId' --output text)"
if [[ -n "$EXISTING" && "$EXISTING" != "None" ]]; then
  echo "Ya existe $EXISTING. Arrancando si está stopped…"
  aws ec2 start-instances --region "$REGION" --instance-ids "$EXISTING" >/dev/null
  aws ec2 wait instance-running --region "$REGION" --instance-ids "$EXISTING"
  IP="$(aws ec2 describe-instances --region "$REGION" --instance-ids "$EXISTING" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)"
  echo "ID=$EXISTING  IP=$IP"
  echo "ssh -i ~/.ssh/${KEY_NAME}.pem ubuntu@$IP"
  echo "STOP: aws ec2 stop-instances --region $REGION --instance-ids $EXISTING"
  exit 0
fi

ID="$(aws ec2 run-instances --region "$REGION" \
  --image-id "$AMI" --instance-type "$TYPE" --key-name "$KEY_NAME" \
  --security-group-ids "$SG_ID" \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":120,"VolumeType":"gp3","DeleteOnTermination":true}}]' \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$NAME}]" \
  --query 'Instances[0].InstanceId' --output text)"

echo "Lanzada $ID — espera ~2 min…"
aws ec2 wait instance-running --region "$REGION" --instance-ids "$ID"
IP="$(aws ec2 describe-instances --region "$REGION" --instance-ids "$ID" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)"

echo
echo "ID=$ID"
echo "IP=$IP"
echo "ssh -i ~/.ssh/${KEY_NAME}.pem ubuntu@$IP"
echo
echo "Luego, desde tu laptop:"
echo "  rsync -avz -e 'ssh -i ~/.ssh/${KEY_NAME}.pem' --exclude .vendor --exclude .venv --exclude data/qdrant --exclude data/models \\"
echo "    ./ ubuntu@$IP:~/DocumentAgent/"
echo "  ssh -i ~/.ssh/${KEY_NAME}.pem ubuntu@$IP 'cd ~/DocumentAgent && bash deploy/aws/setup-instance.sh'"
echo
echo "STOP al terminar el día (el disco se queda):"
echo "  aws ec2 stop-instances --region $REGION --instance-ids $ID"
echo "TERMINATE solo si ya no la quieres (borra GPU y cobra 0):"
echo "  aws ec2 terminate-instances --region $REGION --instance-ids $ID"
