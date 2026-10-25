# 🔒 Přidání HTTPS podpory pro EON nginx

Tento návod vysvětluje, jak přidat HTTPS **jen pro váš EON nginx kontejner** bez změny celého serveru.

---

## 📋 Co budete potřebovat

- ✅ Běžící EON nginx kontejner v Portaineru
- ✅ SSH přístup k NAS serveru
- ✅ 10 minut času

---

## 🚀 Krok za krokem (10 minut)

### Krok 1: Zkopírujte skript na NAS (2 min)

**Windows (SMB):**
```
1. Otevřete: \\10.0.1.51\
2. Najděte složku: eon/
3. Zkopírujte sem: generate-ssl-cert.sh
```

**Linux/Mac (SCP):**
```bash
scp generate-ssl-cert.sh root@10.0.1.51:/srv/eon/
```

### Krok 2: Vygenerujte SSL certifikáty (3 min)

```bash
# 1. Připojte se k NAS
ssh root@10.0.1.51

# 2. Přejděte do složky
cd /srv/eon

# 3. Změňte IP adresu ve skriptu (pokud není 10.0.1.51)
nano generate-ssl-cert.sh
# Změňte řádek: NAS_IP="10.0.1.51" na vaši IP

# 4. Spusťte skript
bash generate-ssl-cert.sh
```

**Co skript udělá:**
- Vytvoří složku `/srv/eon/nginx/ssl/`
- Vygeneruje self-signed certifikát platný 10 let
- Nastaví správná oprávnění

**Očekávaný výstup:**
```
🔐 Generování SSL certifikátů pro EON nginx...
📁 Vytvářím složku pro certifikáty...
🔑 Generuji privátní klíč a certifikát...
✅ Certifikáty byly úspěšně vytvořeny!
```

### Krok 3: Nahraďte nginx konfiguraci (2 min)

```bash
# Na NAS serveru:
cd /srv/eon/nginx

# Zálohujte starou konfiguraci
cp default.conf default.conf.backup

# Zkopírujte novou HTTPS konfiguraci
# (předtím ji musíte nahrát na NAS stejně jako skript)
```

**Nebo ručně:**
1. Stáhněte obsah `nginx-default-https.conf` z projektu
2. Zkopírujte ho na NAS do `/srv/eon/nginx/default.conf`

### Krok 4: Aktualizujte Docker Compose v Portaineru (3 min)

1. **Otevřete Portainer:** `http://10.0.1.51:9000`

2. **Přejděte na:** Stacks → `eon-nginx`

3. **Klikněte:** Editor

4. **Nahraďte obsah** obsahem z `docker-compose-https.yml`:

```yaml
version: '3.8'

services:
  eon-nginx:
    image: nginx:alpine
    container_name: eon-nginx
    restart: unless-stopped

    ports:
      - "8080:80"   # HTTP (redirect na HTTPS)
      - "4545:443"  # HTTPS

    volumes:
      # ZMĚŇTE cestu podle vašeho NAS!
      - /srv/eon/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - /srv/eon/nginx/ssl:/etc/nginx/ssl:ro
      - /srv/eon/data:/usr/share/nginx/html/eon:ro

    networks:
      - eon-network

    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

networks:
  eon-network:
    driver: bridge
```

5. **Důležité:** Změňte `/srv/eon/` na vaši skutečnou cestu!

6. **Klikněte:** Update the stack

7. **Počkejte:** 10-20 sekund na restart

---

## ✅ Test HTTPS

### 1. Test v prohlížeči

```
https://10.0.1.51:4545/eon/eon-config.json
```

**První přístup:**
- ⚠️ Zobrazí se varování "Vaše připojení není soukromé"
- To je **normální** - používáte self-signed certifikát
- Klikněte: **Pokročilé** → **Pokračovat na 10.0.1.51**
- ✅ Měli byste vidět JSON

**Chrome/Edge:**
```
1. Zobrazí se: NET::ERR_CERT_AUTHORITY_INVALID
2. Klikněte: Pokročilé
3. Klikněte: Pokračovat na 10.0.1.51 (nebezpečné)
```

**Firefox:**
```
1. Zobrazí se: Varování: Možné bezpečnostní riziko
2. Klikněte: Rozšířené
3. Klikněte: Přijmout riziko a pokračovat
```

### 2. Test HTTP redirectu

```
http://10.0.1.51:8080/eon/eon-config.json
```

Mělo by vás to automaticky přesměrovat na HTTPS verzi.

### 3. Nastavení v EON aplikaci

**Lokální testování (doporučeno):**
```bash
cd C:\Users\ladis\Desktop\EON\eon
npm start
```
Otevřete: `http://localhost:3000`

**V aplikaci:**
1. Klikněte ⚙️ (nastavení)
2. Zadejte URL: `https://10.0.1.51:4545/eon/eon-config.json`
3. Uložte
4. Zkontrolujte aktualizaci

---

## 🔍 Diagnostika problémů

### ❌ Kontejner nejede

```bash
# Zkontrolujte logy v Portaineru
# Nebo přes SSH:
docker logs eon-nginx --tail 50
```

**Časté chyby:**
- `cannot load certificate` → Certifikáty nebyly správně vygenerovány
- `No such file or directory` → Špatná cesta k SSL složce v docker-compose

### ❌ Certifikáty nefungují

```bash
# Zkontrolujte, že existují:
ls -la /srv/eon/nginx/ssl/
# Měli byste vidět:
# nginx.crt
# nginx.key

# Zkontrolujte certifikát:
openssl x509 -in /srv/eon/nginx/ssl/nginx.crt -noout -text
```

### ❌ Port 4545 není dostupný

```bash
# Zkontrolujte, že port je mapován:
docker ps | grep eon-nginx
# Měli byste vidět: 0.0.0.0:4545->443/tcp

# Zkontrolujte firewall:
# Na OpenMediaVault: Network → Firewall
# Povolte port 4545
```

### ❌ Mixed Content Error (HTTPS → HTTP)

Pokud aplikace běží na HTTPS (Netlify), ale server je HTTP:
- **Řešení 1:** Používejte aplikaci lokálně (`npm start`)
- **Řešení 2:** Použijte tento HTTPS setup ✅

---

## 🎓 Co se stalo?

### Před HTTPS:
```
Aplikace (HTTPS) → ❌ → Server (HTTP)
Netlify              10.0.1.51:8080
```
**Problém:** Mixed Content Error

### Po HTTPS:
```
Aplikace (HTTPS) → ✅ → Server (HTTPS)
Netlify              10.0.1.51:4545
```
**Funguje!** Prohlížeč to povolí.

### Jak to funguje:

1. **Self-signed certifikát:**
   - Vytvořený vámi, ne důvěryhodnou autoritou
   - Prohlížeč zobrazí varování (normální pro lokální použití)
   - Po akceptování funguje HTTPS normálně

2. **Jen nginx kontejner má HTTPS:**
   - Ostatní služby na NAS zůstávají nezměněné
   - Nginx si sám spravuje své certifikáty
   - Žádný vliv na zbytek systému

3. **Port mapping:**
   - Port 443 (HTTPS) v kontejneru → Port 4545 navenek
   - Port 80 (HTTP) v kontejneru → Port 8080 navenek
   - HTTP automaticky redirectuje na HTTPS

---

## 🔒 Bezpečnost

### Self-signed vs Důvěryhodný certifikát

**Self-signed (to co máte teď):**
- ✅ HTTPS šifrování funguje
- ✅ Rychlé nastavení
- ✅ Žádné náklady
- ⚠️ Prohlížeč zobrazí varování při prvním přístupu
- ⚠️ Ne vhodné pro veřejný přístup z internetu

**Důvěryhodný certifikát (Let's Encrypt):**
- ✅ Žádná varování v prohlížeči
- ✅ Vhodné pro veřejný přístup
- ⚠️ Vyžaduje doménové jméno
- ⚠️ Složitější nastavení

### Je self-signed certifikát bezpečný?

**Pro vaše použití (lokální síť): ANO**
- Spojení je šifrované (HTTPS)
- Chráněno před odposloucháváním v místní síti
- Nikdo nemůže vidět data při přenosu

**Varování znamená:**
- "Neznám autoritu, která tento certifikát vydala"
- **NE:** "Spojení není šifrované"
- Pro lokální použití je to v pořádku

---

## 📊 Srovnání

| Funkce | Před (HTTP) | Po (HTTPS) |
|--------|------------|-----------|
| **Port** | 8080 | 4545 |
| **Protokol** | http:// | https:// |
| **Šifrování** | ❌ Ne | ✅ Ano |
| **Mixed Content** | ❌ Chyba na Netlify | ✅ Funguje |
| **Varování v prohlížeči** | ❌ Ne | ⚠️ Při prvním přístupu |
| **Rychlost** | ⚡ Stejná | ⚡ Stejná |
| **Složitost** | 🟢 Jednoduchá | 🟡 Středně složitá |

---

## 🎯 Shrnutí

**Co jste udělali:**
1. ✅ Vygenerovali self-signed SSL certifikáty
2. ✅ Přidali HTTPS podporu do nginx
3. ✅ Aktualizovali Docker kontejner
4. ✅ **Změnili jen tento jeden kontejner, zbytek NAS zůstal nezměněn**

**Nové URL:**
```
https://10.0.1.51:4545/eon/eon-config.json
```

**Výhody:**
- ✅ Funguje s HTTPS aplikací (Netlify)
- ✅ Šifrované spojení
- ✅ Pouze nginx kontejner je dotčen
- ✅ Zbytek NAS serveru zůstal stejný

---

## 📞 Rychlá reference

```bash
# Kontrola certifikátů
ls -la /srv/eon/nginx/ssl/

# Kontrola kontejneru
docker ps | grep eon-nginx

# Logy
docker logs eon-nginx --tail 50

# Test
curl -k https://10.0.1.51:4545/eon/eon-config.json

# Regenerace certifikátů (pokud expirují za 10 let)
bash /srv/eon/generate-ssl-cert.sh
docker restart eon-nginx
```

---

**Hotovo! 🎉**

Váš EON nginx nyní běží na HTTPS a aplikace z Netlify může bezpečně načítat data!
