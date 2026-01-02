# Batalj Deployment Guide

## Lokal Utveckling

### Starta MongoDB i Docker
```bash
./deploy.sh dev start
```

Detta startar endast MongoDB på port 27017.

### Kör webapp och backend lokalt
I separata terminaler:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Webapp
cd webapp
npm install
npm run dev
```

Backend körs på `http://localhost:3000` och webapp på `http://localhost:5173` (Vite dev server).

---

## Lokal Produktion (Test)

För att testa produktionsmiljön lokalt:

```bash
./deploy.sh prod build
```

Applikationen är tillgänglig på `http://localhost:7701`

---

## Deployment till Unraid Server

### Förutsättningar

1. **Unraid server** med Docker installerat
2. **SSH-åtkomst** till Unraid servern
3. **Nginx reverse proxy** konfigurerad på Unraid (hanterar HTTPS och Let's Encrypt)
4. **SSH-nyckel** konfigurerad för password-less login

### Steg 1: Konfigurera SSH-nyckel

Om du inte redan har SSH-nyckel uppsatt:

```bash
# Generera SSH-nyckel (om du inte har en)
ssh-keygen -t ed25519

# Kopiera din SSH-nyckel till Unraid servern
ssh-copy-id root@<unraid-server-ip>

# Testa anslutningen
ssh root@<unraid-server-ip>
```

### Steg 2: Deploya till Unraid

```bash
# Deploy till Unraid server
./deploy-remote.sh <unraid-server-ip> deploy

# Exempel:
./deploy-remote.sh 192.168.1.100 deploy
# eller
./deploy-remote.sh unraid.local deploy
```

Detta kommer att:
1. Synka alla projektfiler till `/mnt/user/appdata/batalj` på Unraid
2. Bygga Docker images
3. Starta alla containers (MongoDB, Backend, Webapp)

Webapp-containern exponerar port **7701**.

### Steg 3: Konfigurera Nginx Reverse Proxy

Konfigurera din Nginx reverse proxy att peka `https://bk.familjensjolin.com` till `http://<unraid-ip>:7701`.

Exempel nginx-konfiguration:

```nginx
server {
    listen 443 ssl http2;
    server_name bk.familjensjolin.com;

    # SSL hanteras av din reverse proxy
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://<unraid-ip>:7701;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Deployment Kommandon

### Deploy och uppdatera applikationen
```bash
./deploy-remote.sh <server> deploy
```

### Starta services
```bash
./deploy-remote.sh <server> start
```

### Stoppa services
```bash
./deploy-remote.sh <server> stop
```

### Starta om services
```bash
./deploy-remote.sh <server> restart
```

### Visa loggar
```bash
./deploy-remote.sh <server> logs
```

### Visa status
```bash
./deploy-remote.sh <server> status
```

### Rensa gamla images och containers
```bash
./deploy-remote.sh <server> cleanup
```

---

## Miljövariabler

En `.env` fil skapas automatiskt från `.env.example` vid första deployment. Standard-inställningar fungerar för de flesta fall, men du kan redigera dem vid behov:

```bash
ssh root@<server>
cd /mnt/user/appdata/batalj
nano .env
```

Tillgängliga miljövariabler:

```bash
# Backend
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongodb:27017/batalj?retryWrites=true
```

---

## Felsökning

### Visa loggar för specifik service
```bash
ssh root@<server>
cd /mnt/user/appdata/batalj
docker compose logs -f backend
docker compose logs -f webapp
docker compose logs -f mongodb
```

### Starta om specifik service
```bash
ssh root@<server>
cd /mnt/user/appdata/batalj
docker compose restart backend
```

### Rebuilda images efter kod-ändringar
```bash
./deploy-remote.sh <server> deploy
```

### Testa MongoDB-anslutning
```bash
ssh root@<server>
docker exec -it batalj-mongodb mongosh batalj
```

---

## Unraid Docker Compose Manager (Alternativ)

Om du föredrar att hantera Docker Compose via Unraid UI:

1. Installera **Docker Compose Manager** plugin från Community Applications
2. Lägg till projektet via UI:
   - Path: `/mnt/user/appdata/batalj`
   - Compose file: `docker-compose.yml`
3. Hantera services via Unraid dashboard

---

## Backup och Återställning

### Backup MongoDB data
```bash
ssh root@<server>
docker exec batalj-mongodb mongodump --db=batalj --out=/data/backup
docker cp batalj-mongodb:/data/backup ./backup-$(date +%Y%m%d)
```

### Återställ MongoDB data
```bash
ssh root@<server>
docker cp ./backup batalj-mongodb:/data/restore
docker exec batalj-mongodb mongorestore --db=batalj /data/restore/batalj
```

---

## Säkerhet

### Rekommendationer:
- Använd SSH-nycklar istället för lösenord
- Konfigurera firewall på Unraid att endast tillåta SSH från kända IP-adresser
- HTTPS hanteras av din nginx reverse proxy
- Backup MongoDB regelbundet
- Håll Docker images uppdaterade

### Uppdatera containers
```bash
./deploy-remote.sh <server> deploy
./deploy-remote.sh <server> cleanup
```

---

## Portar

- **7701**: Webapp (exponerad till host för nginx reverse proxy)
- **7700**: Backend (endast internt i Docker network)
- **27017**: MongoDB (endast internt i Docker network)

---

## Support

Vid problem, kontrollera:
1. Docker loggar: `./deploy-remote.sh <server> logs`
2. Container status: `./deploy-remote.sh <server> status`
3. Nginx reverse proxy konfiguration
4. Firewall inställningar på Unraid
