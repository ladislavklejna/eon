# ⚡ Portainer + Nginx - Rychlý start (5 minut)

Nejrychlejší způsob, jak rozběhnout nginx v Portaineru pro EON aplikaci.

---

## 📋 Checklist přípravy

Před začátkem mějte připraveno:
- [ ] Přístup k OpenMediaVault/NAS
- [ ] Portainer běží a je dostupný
- [ ] Znáte IP adresu NAS (např. 192.168.1.100)
- [ ] Máte soubory: `nginx-default.conf` a `eon-config.json`

---

## 🚀 3 kroky k funkčnímu serveru

### Krok 1: Příprava souborů na NAS (2 min)

**Metoda A: SSH (Linux/Mac)**
```bash
# 1. Připojte se k NAS
ssh root@192.168.1.100

# 2. Vytvořte strukturu
mkdir -p /srv/eon/data
mkdir -p /srv/eon/nginx

# 3. Nebo použijte automatický skript
bash setup-nas.sh
```

**Metoda B: SMB (Windows)**
1. Otevřete `\\192.168.1.100\` v Průzkumníku
2. Vytvořte složky:
   ```
   eon/
   ├── data/
   └── nginx/
   ```
3. Zkopírujte soubory:
   - `nginx-default.conf` → `eon/nginx/default.conf`
   - `eon-config.json` → `eon/data/eon-config.json`

### Krok 2: Deploy v Portaineru (2 min)

1. **Otevřete Portainer:** `http://192.168.1.100:9000`

2. **Stacks → Add stack**

3. **Name:** `eon-nginx`

4. **Zkopírujte docker-compose.yml:**

   ```yaml
   version: '3.8'

   services:
     eon-nginx:
       image: nginx:alpine
       container_name: eon-nginx
       restart: unless-stopped
       ports:
         - "8080:80"
       volumes:
         - /srv/eon/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
         - /srv/eon/data:/usr/share/nginx/html/eon:ro
       networks:
         - eon-network
       healthcheck:
         test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
         interval: 30s
         timeout: 10s
         retries: 3

   networks:
     eon-network:
       driver: bridge
   ```

   ⚠️ **ZMĚŇTE `/srv/eon/` pokud máte jinou cestu!**

5. **Klikněte:** Deploy the stack

6. **Počkejte:** 10-20 sekund na start

### Krok 3: Test a nastavení aplikace (1 min)

1. **Test v prohlížeči:**
   ```
   http://192.168.1.100:8080/eon/eon-config.json
   ```
   ✅ Měli byste vidět JSON

2. **V EON aplikaci:**
   - Klikněte ⚙️ (nastavení)
   - Zadejte URL: `http://192.168.1.100:8080/eon/eon-config.json`
   - Klikněte "Uložit URL"
   - Klikněte "🔄 Zkontrolovat aktualizaci"

3. **Ověření:**
   - Badge by měl ukazovat: 🟢 Server
   - V logách (Portainer) by měl být GET request

---

## ✅ Hotovo!

Váš server běží na: `http://192.168.1.100:8080/eon/eon-config.json`

---

## 🔄 Jak aktualizovat časy topení

### Jednoduchý způsob:

1. **Otevřete soubor:**
   - Windows: `\\192.168.1.100\eon\data\eon-config.json`
   - Linux/Mac: `ssh root@192.168.1.100` → `nano /srv/eon/data/eon-config.json`

2. **Upravte hodnoty:**
   ```json
   { "id": 7, "value": "ne" }  // Změňte "ano" na "ne" nebo naopak
   ```

3. **Změňte verzi:**
   ```json
   "version": "2024-11-06T19:30:00Z"  // Aktuální datum a čas
   ```

4. **Uložte** (Ctrl+S nebo Ctrl+X)

5. **Aplikace detekuje změnu do 5 minut!**

---

## 🐛 Nejčastější problémy

### ❌ "Failed to deploy stack"

**Příčina:** Špatná cesta k souborům

**Řešení:**
```bash
# Ověřte, že soubory existují:
ls -la /srv/eon/nginx/default.conf
ls -la /srv/eon/data/eon-config.json
```

### ❌ Kontejner běží, ale 404

**Příčina:** Soubory nejsou správně namountované

**Řešení v Portaineru:**
1. Containers → eon-nginx → Console
2. Connect: `/bin/sh`
3. V konzoli:
   ```sh
   ls -la /usr/share/nginx/html/eon/
   # Měli byste vidět eon-config.json
   ```

### ❌ CORS Error v aplikaci

**Příčina:** Chybí CORS headers v nginx

**Řešení:**
- Zkontrolujte, že používáte správný `nginx-default.conf`
- V Portaineru: Restart kontejneru

### ❌ Badge ukazuje "⚪ Výchozí"

**Příčina:** Aplikace nemůže kontaktovat server

**Test:**
```bash
# Z PC/telefonu:
curl http://192.168.1.100:8080/eon/eon-config.json

# Pokud nefunguje, zkontrolujte firewall na NAS
```

---

## 📊 Monitoring v Portaineru

### Sledování logů:
1. Containers → `eon-nginx` → **Logs**
2. Vidíte přístupové requesty

### Zdraví kontejneru:
1. Containers → `eon-nginx`
2. Status: **healthy** ✅

### Restart:
1. Containers → `eon-nginx`
2. **Restart** button

---

## 🎓 Co dál?

- ✅ **Základní setup funguje** → používejte aplikaci
- 📚 **Pokročilé nastavení** → viz [PORTAINER_NGINX_SETUP.md](PORTAINER_NGINX_SETUP.md)
- 🔒 **Bezpečnost** → nastavte firewall, VPN
- 🌐 **Reverse proxy** → Traefik, nginx proxy manager

---

## 💡 Tipy

1. **Záloha JSON:** Před editací udělejte kopii
   ```bash
   cp /srv/eon/data/eon-config.json /srv/eon/data/eon-config.json.backup
   ```

2. **Test JSON:** Před nasazením: https://jsonlint.com

3. **Editor:** Použijte VS Code s rozšířením pro JSON

4. **Automatizace:** Pro pokročilé uživatele - skript na automatické generování JSON

---

## 📞 Rychlá diagnostika

```bash
# 1. Běží kontejner?
docker ps | grep eon-nginx

# 2. Logy
docker logs eon-nginx --tail 50

# 3. Test z kontejneru
docker exec eon-nginx ls -la /usr/share/nginx/html/eon/

# 4. Test curl
curl http://localhost:8080/eon/eon-config.json

# 5. Zdraví
docker inspect eon-nginx | grep -A 5 Health
```

---

## 📝 Rychlá reference

| Co | Jak |
|---|---|
| **URL serveru** | `http://192.168.1.100:8080/eon/eon-config.json` |
| **Portainer** | `http://192.168.1.100:9000` |
| **Config na NAS** | `/srv/eon/data/eon-config.json` |
| **Nginx config** | `/srv/eon/nginx/default.conf` |
| **Restart** | Portainer → Containers → eon-nginx → Restart |
| **Logy** | Portainer → Containers → eon-nginx → Logs |

---

**Úspěšný setup! 🎉**

Nyní můžete snadno měnit časy topení 6× ročně editací jednoho JSON souboru!
