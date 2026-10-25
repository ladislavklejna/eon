# 🐳 Nginx v Portaineru - Návod pro EON

Tento návod vás provede nastavením nginx kontejneru v Portaineru pro servírování EON konfigurace.

## 📋 Předpoklady

- OpenMediaVault s nainstalovaným Portainerem
- Přístup k Portainer webovému rozhraní
- Vytvořená složka pro EON data na NAS

---

## 🚀 Metoda 1: Stack v Portaineru (DOPORUČENO)

Nejjednodušší způsob - použití Docker Compose přes Portainer Stack.

### Krok 1: Příprava složky na NAS

1. Přihlaste se do OpenMediaVault
2. Vytvořte sdílenou složku `eon` (pokud ještě neexistuje)
3. Poznamenejte si cestu k mountpointu:
   - Storage → File Systems
   - Typicky: `/srv/dev-disk-by-uuid-XXXXXXX/eon/`

4. Připojte se přes SMB/SSH a vytvořte strukturu:
```bash
/srv/dev-disk-by-uuid-XXXXXXX/eon/
├── data/
│   └── eon-config.json        # Váš konfigurační soubor
└── nginx/
    └── default.conf            # Nginx konfigurace
```

### Krok 2: Vytvoření nginx konfigurace

SSH do NAS nebo přes SMB vytvořte soubor:

**`/srv/dev-disk-by-uuid-XXXXXXX/eon/nginx/default.conf`**

```nginx
server {
    listen 80;
    server_name _;

    # Přístup k root
    location / {
        return 404;
    }

    # EON konfigurace
    location /eon/ {
        alias /usr/share/nginx/html/eon/;

        # Povolit listing souborů (volitelné, pro debug)
        autoindex off;

        # CORS headers pro přístup z aplikace
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization' always;

        # Zakázat cache pro vždy aktuální konfiguraci
        add_header 'Cache-Control' 'no-cache, no-store, must-revalidate' always;
        add_header 'Pragma' 'no-cache' always;
        add_header 'Expires' '0' always;

        # Security headers
        add_header 'X-Content-Type-Options' 'nosniff' always;
        add_header 'X-Frame-Options' 'DENY' always;

        # OPTIONS pre-flight request
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        # Pouze GET metody
        if ($request_method !~ ^(GET|HEAD|OPTIONS)$) {
            return 405;
        }

        # Default typ pro JSON
        types {
            application/json json;
        }

        default_type application/json;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
```

### Krok 3: Zkopírování eon-config.json

```bash
# SSH do NAS
ssh root@192.168.1.100

# Zkopírujte config
cp /cesta/k/eon-config.json /srv/dev-disk-by-uuid-XXXXXXX/eon/data/eon-config.json

# Nastavte oprávnění
chmod 644 /srv/dev-disk-by-uuid-XXXXXXX/eon/data/eon-config.json
```

### Krok 4: Vytvoření Stack v Portaineru

1. Otevřete Portainer: `http://NAS-IP:9000`
2. Vyberte váš environment (local)
3. V menu klikněte na **Stacks**
4. Klikněte **+ Add stack**
5. Pojmenujte: `eon-nginx`
6. V **Web editor** vložte:

```yaml
version: '3.8'

services:
  eon-nginx:
    image: nginx:alpine
    container_name: eon-nginx
    restart: unless-stopped

    ports:
      - "8080:80"  # Externí port 8080 -> interní 80

    volumes:
      # Nginx konfigurace
      - /srv/dev-disk-by-uuid-XXXXXXX/eon/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro

      # Data složka s JSON
      - /srv/dev-disk-by-uuid-XXXXXXX/eon/data:/usr/share/nginx/html/eon:ro

    networks:
      - eon-network

    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

    labels:
      - "com.eon.description=EON Heating Configuration Server"
      - "com.eon.version=1.0"

networks:
  eon-network:
    driver: bridge
```

**⚠️ DŮLEŽITÉ:** Změňte `/srv/dev-disk-by-uuid-XXXXXXX/` na vaší skutečnou cestu!

7. Klikněte **Deploy the stack**

### Krok 5: Ověření

1. Počkejte cca 10 sekund na start kontejneru
2. V prohlížeči otevřete:
   ```
   http://192.168.1.100:8080/eon/eon-config.json
   ```
3. Měli byste vidět váš JSON!

---

## 🔧 Metoda 2: Ruční vytvoření kontejneru v Portaineru

Pokud nechcete použít Stack:

### Krok 1: Containers → Add container

1. V Portaineru: **Containers** → **+ Add container**
2. Vyplňte:

**Name:** `eon-nginx`

**Image:** `nginx:alpine`

**Port mapping:**
- Host: `8080`
- Container: `80`

**Volumes:**
Klikněte **+ map additional volume** (2x):

1. **Volume:**
   - Container: `/etc/nginx/conf.d/default.conf`
   - Host/Volume: `/srv/dev-disk-by-uuid-XXXXXXX/eon/nginx/default.conf`
   - Read only: ✅

2. **Volume:**
   - Container: `/usr/share/nginx/html/eon`
   - Host/Volume: `/srv/dev-disk-by-uuid-XXXXXXX/eon/data`
   - Read only: ✅

**Restart policy:** `Unless stopped`

3. Klikněte **Deploy the container**

---

## 📊 Monitoring v Portaineru

### Sledování logů:

1. Containers → `eon-nginx` → **Logs**
2. Měli byste vidět přístupové logy

### Kontrola zdraví:

1. Containers → `eon-nginx` → **Inspect**
2. Zkontrolujte status a health check

### Restart kontejneru:

1. Containers → `eon-nginx`
2. Klikněte **Restart**

---

## 🔄 Aktualizace konfigurace

Když chcete změnit časy topení:

### Metoda A: Přes SMB (Windows)

1. Otevřete `\\192.168.1.100\eon\data\`
2. Upravte `eon-config.json`
3. Změňte `version` na novou hodnotu
4. Uložte

**Kontejner se automaticky restartovat nemusí!** Nginx servíruje soubor přímo.

### Metoda B: Přes SSH

```bash
ssh root@192.168.1.100
cd /srv/dev-disk-by-uuid-XXXXXXX/eon/data
nano eon-config.json
# Upravte a uložte (Ctrl+X, Y, Enter)
```

### Metoda C: Portainer Console

1. Containers → `eon-nginx` → **Console**
2. Connect: **Command: /bin/sh**
3. V konzoli:
```sh
cd /usr/share/nginx/html/eon
cat eon-config.json
# Poznámka: soubor je read-only, editujte na hostu
```

---

## 🌐 Nastavení aplikace

V EON aplikaci nastavte URL:

```
http://192.168.1.100:8080/eon/eon-config.json
```

(Změňte IP na vaší NAS IP adresu)

---

## 🐛 Řešení problémů

### ❌ Kontejner se nespustí

**Zkontrolujte logy:**
```bash
# V Portaineru: Containers → eon-nginx → Logs
```

**Častá chyba:** Nesprávná cesta k souborům
```
nginx: [emerg] open() "/etc/nginx/conf.d/default.conf" failed
```
**Řešení:** Zkontrolujte, že cesty existují na hostu

### ❌ 404 Not Found

**Zkontrolujte:**
1. Je soubor na správném místě?
   ```bash
   ls -la /srv/dev-disk-by-uuid-XXXXXXX/eon/data/
   ```

2. Jsou správné volumes v kontejneru?
   ```bash
   # V Portainer Console:
   ls -la /usr/share/nginx/html/eon/
   ```

### ❌ CORS Error v aplikaci

**Zkontrolujte nginx config:**
```bash
# V Portainer Console:
cat /etc/nginx/conf.d/default.conf
```

Ujistěte se, že obsahuje CORS headers (viz Krok 2)

### ❌ Kontejner běží, ale JSON se nenačte

**Test z terminálu NAS:**
```bash
curl http://localhost:8080/eon/eon-config.json
```

**Test z aplikace/PC:**
```bash
curl http://192.168.1.100:8080/eon/eon-config.json
```

---

## 🔒 Bezpečnost

### Doporučení:

1. **Firewall pravidla:** Port 8080 otevřete pouze pro lokální síť
2. **Read-only volumes:** Již nastaveno v docker-compose
3. **Nepřístupný root:** Nginx vrací 404 na `/`
4. **Žádný autoindex:** Vypnuto v konfiguraci

### Nastavení firewallu (volitelné):

```bash
# Povolit pouze z lokální sítě
iptables -A INPUT -p tcp --dport 8080 -s 192.168.1.0/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 8080 -j DROP
```

---

## 📈 Pokročilé: Reverse Proxy

Pokud už máte hlavní nginx/Traefik:

### Traefik labels:

Přidejte do Stack do sekce `labels`:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.eon.rule=Host(`eon.local`)"
  - "traefik.http.routers.eon.entrypoints=web"
  - "traefik.http.services.eon.loadbalancer.server.port=80"
```

---

## 🔄 Update nginx image:

V Portaineru:

1. **Stacks** → `eon-nginx` → **Editor**
2. Klikněte **Update the stack**
3. Zaškrtněte **Re-pull image**
4. Klikněte **Update**

Nebo v Containers:

1. Containers → `eon-nginx`
2. **Recreate**
3. Zaškrtněte **Pull latest image**

---

## 📝 Rychlý checklist

- [ ] Vytvořena složka `/srv/.../eon/data/` s `eon-config.json`
- [ ] Vytvořena složka `/srv/.../eon/nginx/` s `default.conf`
- [ ] V Portaineru vytvořen Stack nebo Container
- [ ] Port 8080 je dostupný
- [ ] URL `http://NAS-IP:8080/eon/eon-config.json` funguje
- [ ] V aplikaci nastavena URL serveru
- [ ] Badge ukazuje 🟢 Server

---

## 💡 Tipy

1. **Testování změn:** Před editací JSON použijte https://jsonlint.com
2. **Backup:** Pravidelně zálohujte `eon-config.json`
3. **Monitoring:** Sledujte logy v Portaineru při prvních aktualizacích
4. **Vývoj:** Pro vývoj použijte port 3001, pro produkci 8080

---

## 📞 Rychlá diagnostika

```bash
# 1. Je kontejner running?
docker ps | grep eon-nginx

# 2. Zdraví kontejneru?
docker inspect eon-nginx | grep -A 5 Health

# 3. Logy?
docker logs eon-nginx --tail 50

# 4. Test z kontejneru?
docker exec eon-nginx ls -la /usr/share/nginx/html/eon/

# 5. Test curl?
docker exec eon-nginx curl http://localhost/eon/eon-config.json
```

---

**Hotovo! 🎉**

Váš nginx kontejner v Portaineru je připraven servírovat EON konfiguraci!

Pro testování otevřete: `http://192.168.1.100:8080/eon/eon-config.json`
