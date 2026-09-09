# Paso a paso: DocumentAgent en AWS

Guía para hacer el PoC **sin comprar GPU**. Alquilas una máquina unas horas, pruebas, y la apagas.

**Qué vamos a montar:** una EC2 `g5.xlarge` (GPU NVIDIA ~24 GB) en `us-east-1`, con el mismo código que ya tienes (PDF → chunks → Qdrant → más adelante Ollama/Qwen).

**Qué no vamos a usar:** Bedrock, Knowledge Bases, OpenAI, H100.

**Cuánto cuesta:** ver la sección **Costos** más abajo. Tope del PoC: **USD 80**. El error caro es dejarla `running` de noche.

---

## Costos (us-east-1, On-Demand Linux, sept. 2026)

Precios de lista. AWS puede variar un poco; confirma en [calculadora EC2](https://calculator.aws).

### Lo que se paga

| Ítem | Precio | ¿Cuándo se cobra? |
|---|---|---|
| **g6.xlarge** (L4, 24 GB, recomendada) | **USD 0.80 / h** | Solo `running` |
| **g5.xlarge** (A10G, 24 GB) | **USD 1.01 / h** | Solo `running` |
| Disco EBS 120 GB gp3 | **USD 0.08 / GB-mes ≈ 9.60 / mes** | Aunque esté **Stopped** |
| IPv4 pública | USD 0.005 / h ≈ 0.40 por jornada de 8 h | Solo `running` |
| Transferencia (SSH, pocas consultas) | Primeros 100 GB/mes salientes free | Casi 0 en el PoC |

No hay cargo de Ollama, Qdrant ni el modelo: viven en el disco. Bedrock no entra.

**Stop** = dejas de pagar GPU e IP. **Sigue el disco (~USD 10/mes).**  
**Terminate** = USD 0, pero pierdes modelos e índice.

No uses Spot en el PoC: AWS puede apagarte la máquina a mitad de una demo.

### Escenarios (con g6.xlarge)

| Cómo lo usas | Horas GPU | Cálculo | **Total** |
|---|---|---|---|
| Una tarde de prueba | 4 h | 4×0.80 + disco prorrateado | **≈ USD 4–6** |
| PoC S5–S6 (apagando cada día) | 40 h + 1 mes disco | 32 + 10 | **≈ USD 42** |
| PoC más holgado (tope) | 60 h + 1.5 mes disco | 48 + 15 | **≈ USD 63** |
| Olvidaste Stop 1 noche (12 h) | +12 h | +10 | **+ USD 10** |
| Olvidaste Stop **un mes** (24/7) | 730 h | 730×0.80 + 10 + 4 | **≈ USD 600** |
| “Mantenerlo” horario oficina (8 h × 22 días) | 176 h/mes | 141 + 10 + 1 | **≈ USD 150 / mes** |
| Producción 24/7 en AWS | 730 h/mes | 588 + 10 + 4 | **≈ USD 600 / mes** |
| Instancia Stopped (solo guardar disco) | 0 h | 9.60 | **≈ USD 10 / mes** |
| PoC cerrado, todo Terminate | 0 | 0 | **USD 0** |

Con **g5.xlarge** suma ~25% (p. ej. oficina ≈ USD 190/mes, 24/7 ≈ USD 750/mes).

### Si consultan muchos a la vez

No pagas por pregunta. Una `g6.xlarge` cuesta lo mismo con 1 usuario o con 20 **en cola**. Lo que se satura es la **GPU**: Qwen 14B en 24 GB atiende bien **1 generación a la vez** (a veces 2 si bajas el contexto). El resto espera.

“Muchos” no es “10 personas en el departamento”. Es “cuántos aprietan Enviar en el mismo segundo”.

| Situación | ¿Alcanza 1× g6.xlarge? | Costo (horario oficina, ~176 h/mes) |
|---|---|---|
| PoC / 1 tester | Sí | ≈ USD 150 / mes |
| 3–8 ingenieros a lo largo del día, casi nunca juntos | Sí (cola corta) | **El mismo ≈ USD 150 / mes** |
| 5–10 preguntas **a la vez** (reunión, arranque de turno) | Justo: 15 s se vuelven 1–2 min | Sigue USD 150, pero la UX se cae |
| 10–20 concurrentes fijos | No. 2 GPU o instancia más grande | **≈ USD 300 / mes** (2× g6) o ~USD 200–250 una `g6.2xlarge` |
| 50+ concurrentes | Varias GPU o otro diseño | **USD 600–2 000+ / mes** |

Regla práctica: usuarios simultáneos ≈ número de GPUs de 24 GB.  
10 personas en la mina que preguntan 5 veces al día ≈ **1 GPU**.  
10 personas preguntando al mismo tiempo ≈ **varias GPU** o aceptas cola.

Bedrock sí cobra por token: 1 000 preguntas/día puede ser barato o caro según el modelo, pero **no** es el stack que luego llevas onsite.

### Qué conviene según la fase

| Fase | Recomendación | Costo típico |
|---|---|---|
| **Ahora (PoC)** | g6, Stop diario, tope USD 80 | **USD 40–65** en total, no al mes |
| **Piloto 2–5 personas, 1–2 meses** | Misma EC2, 8 h/día | **≈ USD 150 / mes** |
| **Uso permanente** | Comprar 1× RTX 4090 / A5000 onsite y apagar AWS | **USD 0 / mes** en nube + fierro una vez |
| **AWS 24/7 “para no comprar GPU”** | Sale más caro que el fierro en ~3–4 meses | **≈ USD 600 / mes** |

Una RTX 4090 de escritorio (~USD 1.6–2.0 k una vez) se paga sola frente a ~USD 150–600/mes en EC2 si el sistema queda en producción.

### Presupuesto que yo usaría

1. Budget diario **USD 20** (paso 2 de esta guía).
2. PoC: **máximo USD 80**, ~50–70 h de `g6`.
3. No Reserved Instance ni contrato 1 año hasta saber si se quedan en AWS.
4. Después del go: o **onsite**, o si siguen en nube, 8 h/día (~USD 150/mes), nunca 24/7 sin usuarios de noche.

**Dónde corres cada paso:**

| Dónde | Qué |
|---|---|
| Navegador (consola AWS) | Cuenta, billing, comprobar que está `stopped` |
| WSL / terminal en `DocumentAgent` | CLI, launch, rsync, SSH |
| Dentro de la EC2 (SSH) | Docker, Ollama, ingest, retrieve |

Anota en un bloc:

```
ID de instancia: i-________________
IP pública: ________________
Región: us-east-1
Key: ~/.ssh/documentagent-poc.pem
```

La IP **cambia** cada vez que haces Stop + Start (salvo que pidas Elastic IP; no hace falta para el PoC).

---

## Paso 1 — Cuenta AWS

1. Entra a [https://aws.amazon.com](https://aws.amazon.com) y crea cuenta o inicia sesión (correo + tarjeta; cobran solo lo que uses).
2. Confirma el mail.
3. Arriba a la derecha, elige la región **N. Virginia (`us-east-1`)**. Si estás en otra, cámbiala. Las `g5` a veces no existen en todas las regiones.
4. Si es cuenta nueva, puede pedirte verificación. Sin eso no lanza GPU.

---

## Paso 2 — Alarma de plata (hazlo ANTES de la GPU)

1. Consola → busca **Billing** (o [https://console.aws.amazon.com/billing](https://console.aws.amazon.com/billing)).
2. Menú **Budgets** → **Create budget**.
3. Tipo: **Cost budget**.
4. Periodo: **Daily**.
5. Monto: **20** USD.
6. Alerta al **80%** y al **100%**, al correo que uses.
7. Guarda.

Opcional: **Billing preferences** → activa alertas de factura mensual.

Sin esto, no pases al paso 5.

---

## Paso 3 — AWS CLI en WSL

En tu terminal WSL (la misma donde está el proyecto):

```bash
cd /home/robinsonnolasco/Proyectos/DocumentAgent
sudo apt-get update
sudo apt-get install -y unzip curl
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -o /tmp/awscliv2.zip -d /tmp
sudo /tmp/aws/install
aws --version
```

Debes ver algo como `aws-cli/2.x`.

---

## Paso 4 — Entrar a AWS desde la terminal

Tienes dos caminos. Elige **uno**.

### Opción A — Access keys (la más simple para PoC)

1. Consola → tu nombre (arriba derecha) → **Security credentials**.
2. **Access keys** → **Create access key** → “Command Line Interface” → crea.
3. Copia **Access key ID** y **Secret access key** (el secret solo se ve una vez).
4. En WSL:

```bash
aws configure
```

Pega:

- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output: `json`

### Opción B — SSO (si tu empresa ya lo usa)

```bash
aws configure sso
```

Sigue las preguntas (URL del portal, región `us-east-1`). Luego:

```bash
aws sso login --profile NOMBRE_DEL_PERFIL
export AWS_PROFILE=NOMBRE_DEL_PERFIL
```

### Comprobar que funciona

```bash
aws sts get-caller-identity
```

Tiene que devolver `Account`, `Arn` y `UserId`. Si sale `Unable to locate credentials` o `ExpiredToken`, no sigas: el login falló.

---

## Paso 5 — ¿Puedes lanzar una g5? (cuota)

Cuentas nuevas a veces tienen cuota **0** de GPU.

```bash
aws service-quotas get-service-quota \
  --region us-east-1 \
  --service-code ec2 \
  --quota-code L-DB2E81BA \
  --query 'Quota.Value'
```

- Si ves `0` o error de cuota: Consola → **Service Quotas** → Amazon EC2 → busca **Running On-Demand G and VT instances** → **Request increase** a `4` (vale para una `g5.xlarge`). Tarda horas o 1–2 días. Mientras tanto **no** intentes `run-instances`.
- Si ves `4` o más: sigue.

---

## Paso 6 — Levantar la instancia (empieza a cobrar)

Estando en la carpeta del proyecto:

```bash
cd /home/robinsonnolasco/Proyectos/DocumentAgent
chmod +x deploy/aws/launch.sh deploy/aws/setup-instance.sh
AWS_REGION=us-east-1 bash deploy/aws/launch.sh
```

**Qué hace el script:**

1. Averigua tu IP pública.
2. Busca la AMI *Deep Learning OSS Nvidia Driver GPU PyTorch Ubuntu 22.04* (ya trae drivers NVIDIA y suele traer Docker).
3. Crea (si no existe) la llave `~/.ssh/documentagent-poc.pem`.
4. Crea el security group `documentagent-poc-sg`: **solo puerto 22 desde tu IP**. Nada de 80, 6333 ni 11434 abiertos al mundo.
5. Lanza `g5.xlarge` con disco **120 GB gp3**, nombre `documentagent-poc`.
6. Si ya existía una instancia con ese nombre `stopped`, la **arranca** (no crea otra).

Copia el `ID=` y el `IP=` que imprime.

**Si falla:**

| Mensaje | Qué hacer |
|---|---|
| `VcpuLimitExceeded` / `InsufficientInstanceCapacity` | Cuota o no hay g5 en esa AZ. Pide cuota o prueba `INSTANCE_TYPE=g6.xlarge bash deploy/aws/launch.sh` |
| `UnauthorizedOperation` | Tu usuario IAM no puede crear EC2. Pide admin o usa el usuario root de la cuenta PoC |
| No encuentra AMI | La región no es `us-east-1` o cambió el nombre de la AMI |

**Alternativa consola** (si no quieres el script):

1. EC2 → **Launch instance**.
2. Name: `documentagent-poc`.
3. AMI: busca `Deep Learning OSS Nvidia Driver AMI GPU PyTorch` Ubuntu 22.04.
4. Instance type: `g5.xlarge`.
5. Key pair: crea `documentagent-poc` y descarga el `.pem` a `~/.ssh/documentagent-poc.pem`, luego `chmod 400 ~/.ssh/documentagent-poc.pem`.
6. Network: default VPC. Security group: solo SSH, My IP.
7. Storage: **120 GiB gp3**.
8. Launch. Espera *Running* y copia la IPv4 pública.

Desde este momento **estás pagando ~USD 1.20/h**.

---

## Paso 7 — Entrar por SSH (primera vez)

Espera 1–2 minutos después de *Running* (el SO está arrancando).

```bash
ssh -i ~/.ssh/documentagent-poc.pem ubuntu@PEGAR_IP_AQUI
```

La primera vez pregunta `Are you sure you want to continue connecting?` → escribe `yes`.

Si dice `Permission denied (publickey)`: la key no es esa o el usuario no es `ubuntu`.

Si dice `Connection timed out`:

- La instancia aún no está lista, o
- Tu IP cambió (café, VPN, datos del celular). En EC2 → Security Groups → `documentagent-poc-sg` → edita la regla SSH y pon tu IP actual (`curl -s https://checkip.amazonaws.com`).

Ya dentro, comprueba GPU:

```bash
nvidia-smi
```

Debes ver una GPU (A10G en g5, L4 en g6) y memoria ~22–23 GB. Si `command not found`, no es la AMI correcta: no sigas instalando a ciegas; relanza con la AMI de Deep Learning.

Sal de la EC2 (`exit`). El resto del paso 8 es **en tu WSL**, no dentro de SSH.

---

## Paso 8 — Subir el proyecto y los PDF

En WSL, en la carpeta del repo (sustituye `PEGAR_IP`):

```bash
cd /home/robinsonnolasco/Proyectos/DocumentAgent

rsync -avz -e "ssh -i ~/.ssh/documentagent-poc.pem" \
  --exclude .vendor \
  --exclude .venv \
  --exclude data/qdrant \
  --exclude data/models \
  --exclude data/ollama \
  ./ ubuntu@PEGAR_IP:~/DocumentAgent/
```

Esto copia código, `src/`, `data/raw/` (los 6 PDF), `data/set-dorado.json`, compose, etc. **No** copies `.vendor` ni el índice local: en la GPU se regeneran.

Comprueba:

```bash
ssh -i ~/.ssh/documentagent-poc.pem ubuntu@PEGAR_IP 'ls ~/DocumentAgent/data/raw/*.pdf'
```

Tienes que ver los 6 PDF. Si no, el `rsync` no corrió desde la carpeta correcta.

---

## Paso 9 — Instalar el stack en la EC2 (Qdrant + Ollama)

Entra otra vez:

```bash
ssh -i ~/.ssh/documentagent-poc.pem ubuntu@PEGAR_IP
cd ~/DocumentAgent
bash deploy/aws/setup-instance.sh
```

El script:

1. Corre `nvidia-smi`.
2. Levanta `docker compose` (Qdrant + Ollama con GPU).
3. Baja `qwen3:8b` y le pregunta “Di solo: ok”.

Si te dice que salgas y vuelvas a entrar por Docker (grupo `docker`):

```bash
exit
ssh -i ~/.ssh/documentagent-poc.pem ubuntu@PEGAR_IP
cd ~/DocumentAgent
bash deploy/aws/setup-instance.sh
```

Comprobaciones a mano:

```bash
docker compose -f docker-compose.yml -f docker-compose.gpu.yml ps
curl -s http://127.0.0.1:6333
```

Qdrant debe responder JSON con `"title":"qdrant..."`.

---

## Paso 10 — Bajar Qwen 14B (el modelo del PoC)

Sigue **dentro** de la EC2. Tarda 5–15 min (~9 GB):

```bash
docker compose -f docker-compose.yml -f docker-compose.gpu.yml exec ollama ollama pull qwen3:14b
docker compose -f docker-compose.yml -f docker-compose.gpu.yml exec ollama ollama run qwen3:14b "Responde solo: listo"
```

Si 14B no entra (error de memoria):

```bash
docker compose -f docker-compose.yml -f docker-compose.gpu.yml exec ollama ollama run qwen3:8b "Responde solo: listo"
```

Anota si usaste 8B o 14B. El PoC admite 8B como fallback.

---

## Paso 11 — Ingesta + índice (lo mismo que en tu laptop)

Sigue dentro de la EC2:

```bash
cd ~/DocumentAgent
python3 -m pip install -r requirements.txt --user
# si pip se queja de "externally-managed":
python3 -m pip install -r requirements.txt --user --break-system-packages

python3 src/ingest.py
python3 src/retrieve.py index
python3 src/retrieve.py eval
```

`ingest` debe reportar ~535 chunks. `eval` debería acercarse al **9/10** que ya viste en local (o mejor si luego hacemos S4).

Prueba una pregunta:

```bash
python3 src/retrieve.py search "¿Quién dictó el curso de etapas de una mina?"
```

Tienes que ver archivo + página + un score.

El **chat con citas (S5)** todavía no está en el repo. Cuando lo escribamos, hablará con Ollama en `http://127.0.0.1:11434` **solo dentro** de la máquina. No abras ese puerto en el security group.

---

## Paso 12 — Apagar al terminar el día (obligatorio)

**Desde WSL** (no hace falta estar en SSH):

```bash
aws ec2 stop-instances --region us-east-1 --instance-ids i-PEGAR_ID
aws ec2 wait instance-stopped --region us-east-1 --instance-ids i-PEGAR_ID
aws ec2 describe-instances --region us-east-1 --instance-ids i-PEGAR_ID \
  --query 'Reservations[0].Instances[0].State.Name'
```

Tiene que decir `stopped`.

Confírmalo también en la consola: EC2 → Instances → `documentagent-poc` → **Stopped** (icono rojo/gris, no verde).

| Acción | ¿Pagas GPU? | ¿Se pierden modelos e índice? |
|---|---|---|
| **Stop** | No | No (quedan en el disco) |
| **Terminate** | No | **Sí, se borra todo** |

Usa **Terminate** solo cuando cierres el PoC de verdad:

```bash
aws ec2 terminate-instances --region us-east-1 --instance-ids i-PEGAR_ID
```

---

## Paso 13 — Al día siguiente (seguir trabajando)

```bash
aws ec2 start-instances --region us-east-1 --instance-ids i-PEGAR_ID
aws ec2 wait instance-running --region us-east-1 --instance-ids i-PEGAR_ID
aws ec2 describe-instances --region us-east-1 --instance-ids i-PEGAR_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text
```

Esa IP **nueva** es la que usas en `ssh` y `rsync`.

```bash
ssh -i ~/.ssh/documentagent-poc.pem ubuntu@IP_NUEVA
cd ~/DocumentAgent
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d
nvidia-smi
```

No hace falta volver a `ollama pull` ni a `retrieve.py index` si no cambiaste los PDF.

Si cambiaste PDF en el laptop:

```bash
# en WSL
rsync -avz -e "ssh -i ~/.ssh/documentagent-poc.pem" \
  --exclude .vendor --exclude .venv --exclude data/qdrant --exclude data/models --exclude data/ollama \
  ./ ubuntu@IP_NUEVA:~/DocumentAgent/

# en la EC2
python3 src/ingest.py
python3 src/retrieve.py index
```

---

## Orden de un día de trabajo (resumen)

1. Billing alarma ya creada (solo la primera vez).
2. `start-instances` (o `launch.sh` la primera vez).
3. Anotar IP nueva.
4. `ssh` → `nvidia-smi` → compose up.
5. Trabajar (ingest / eval / más adelante chat).
6. Salir.
7. `stop-instances` + mirar la consola en **Stopped**.

---

## Qué no hacer

- Dejar la instancia `running` y cerrar el portátil.
- Abrir 6333 o 11434 a `0.0.0.0/0`.
- Lanzar `g5.12xlarge`, `p3`, `p4` o H100.
- Usar Bedrock “para ir más rápido”.
- Hacer **Terminate** pensando que es Pause: pierdes los modelos y tienes que bajarlos otra vez.
- Pegar el `.pem` en el chat o en git.

---

## Checklist (marca en `gant.md` cuando toque)

- [ ] `aws --version` funciona
- [ ] `aws sts get-caller-identity` funciona
- [ ] Budget USD 20/día
- [ ] Cuota G/VT > 0
- [ ] Instancia `documentagent-poc` Running
- [ ] `nvidia-smi` ve la GPU
- [ ] 6 PDF en `~/DocumentAgent/data/raw/`
- [ ] Qdrant responde en `6333`
- [ ] `ollama run qwen3:8b` (o 14b) responde
- [ ] `python3 src/retrieve.py eval` corre
- [ ] Instancia **Stopped** al irte
