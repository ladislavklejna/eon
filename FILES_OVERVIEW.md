# 📁 EON - Přehled souborů

Kompletní přehled všech souborů v projektu a jejich účel.

---

## 🎨 Aplikační soubory

### `src/App.js`
- Hlavní komponenta aplikace
- Obsahuje logiku pro načítání konfigurace
- Automatická kontrola aktualizací
- **Důležité:** Používá ConfigService pro načítání dat

### `src/App.css`
- Hlavní styly aplikace
- Moderní glassmorphism design
- Responzivní pro mobil, tablet, desktop
- CSS proměnné pro snadné přizpůsobení barev

### `src/Weather.jsx` + `Weather.css`
- Komponenta pro zobrazení počasí
- Načítá data z open-meteo.com API
- 6 hodinová prognóza

### `src/data.jsx` + `src/dataWeekend.jsx`
- **Fallback data** - používá se když není dostupná konfigurace ze serveru
- Obsahuje výchozí časový plán

---

## 🔧 Servisní a komponenty

### `src/services/ConfigService.js`
**Klíčový soubor!** Stará se o:
- ✅ Načítání JSON ze vzdáleného serveru
- ✅ Ukládání do localStorage (offline režim)
- ✅ Kontrolu verzí a detekci aktualizací
- ✅ Fallback na výchozí data
- ✅ Timeout a error handling

**Metody:**
- `getConfig()` - Načte konfiguraci (ze serveru → local → default)
- `checkForUpdate()` - Zkontroluje dostupnost nové verze
- `setServerUrl(url)` - Nastaví URL serveru
- `clearLocal()` - Vymaže lokální cache

### `src/components/UpdateNotification.jsx` + `.css`
- Krásná notifikace o dostupné aktualizaci
- Modal dialog s informacemi o verzích
- Akce: "Aktualizovat nyní" / "Později"

### `src/components/Settings.jsx` + `.css`
- Panel nastavení
- Nastavení URL serveru
- Zobrazení verze a poslední aktualizace
- Možnost vymazat cache
- Manuální kontrola aktualizace

---

## 📝 Konfigurační soubory

### `public/eon-config.json`
**Vzorová konfigurace** - ukázkový JSON soubor

**Struktura:**
```json
{
  "version": "2024-11-06T18:00:00Z",      // Verze pro detekci aktualizací
  "lastUpdated": "...",                    // Čas poslední úpravy
  "description": "...",                    // Popis
  "validFrom": "2024-02-01",              // Platnost od
  "validTo": "2024-04-01",                // Platnost do
  "weekday": [...],                        // Rozvrh všední dny
  "weekend": [...]                         // Rozvrh víkend
}
```

**Použití:** Zkopírovat na NAS server

---

## 🐳 Docker a Portainer

### `docker-compose.yml`
**Pro Portainer Stack**

Obsahuje:
- nginx:alpine image
- Port mapping (8080:80)
- Volume mounting pro config a data
- Health check
- Resource limits

**Použití:**
1. Otevřít v Portaineru: Stacks → Add stack
2. Zkopírovat obsah
3. **Změnit cesty** k vašim NAS cestám
4. Deploy

### `nginx-default.conf`
**Nginx konfigurace**

Obsahuje:
- ✅ CORS headers (povolit přístup z aplikace)
- ✅ Cache vypnutý (vždy aktuální data)
- ✅ Security headers
- ✅ Health check endpoint (`/health`)
- ✅ Pouze GET metody

**Použití:**
- Zkopírovat na NAS: `/srv/eon/nginx/default.conf`
- Bude namountovaný do kontejneru

---

## 📚 Dokumentace

### `PORTAINER_NGINX_SETUP.md`
**Kompletní návod pro Portainer**

Obsahuje:
- ✅ Detailní setup Portaineru
- ✅ 2 metody: Stack / Ruční kontejner
- ✅ Konfiguraci nginx
- ✅ Troubleshooting
- ✅ Bezpečnostní tipy
- ✅ Monitoring v Portaineru

**Pro koho:** Detailní návod pro pokročilé

### `PORTAINER_QUICKSTART.md`
**5minutový rychlý start**

Obsahuje:
- ✅ 3 kroky k funkčnímu serveru
- ✅ Rychlý checklist
- ✅ Nejčastější problémy
- ✅ Rychlá diagnostika

**Pro koho:** Rychlý start pro začátečníky

### `NAS_SETUP.md`
**Původní návod pro OpenMediaVault**

Obsahuje:
- ✅ Setup bez Dockeru (nginx/Apache nativně)
- ✅ Alternativní metody
- ✅ Firewall a VPN
- ✅ Vzdálený přístup

**Pro koho:** Pokud nechcete používat Docker/Portainer

### `README_IONIC.md`
**Hlavní dokumentace aplikace**

Obsahuje:
- ✅ Přehled funkcí
- ✅ Struktura projektu
- ✅ JSON formát
- ✅ Build instrukce (web + mobil)
- ✅ Přizpůsobení

**Pro koho:** Vývojáři, uživatelé chtějící rozumět aplikaci

### `QUICKSTART.md`
**5minutový start aplikace**

Obsahuje:
- ✅ Rychlé spuštění
- ✅ Testování bez NAS
- ✅ Build pro mobil
- ✅ Nejčastější problémy

**Pro koho:** První spuštění aplikace

---

## 🛠️ Pomocné skripty

### `generate-config.js`
**Node.js skript pro generování JSON**

**Použití:**
```bash
node generate-config.js
```

**Co dělá:**
- Generuje `eon-config.json` s aktuálním timestampem
- Přehledná konfigurace v JS (true/false místo "ano"/"ne")
- Automatické vytvoření verze
- Výpis přehledu nastavení

**Pro koho:** Rychlé vytvoření nové konfigurace

### `setup-nas.sh`
**Bash skript pro automatické nastavení NAS**

**Použití:**
```bash
sudo bash setup-nas.sh
```

**Co dělá:**
- Vytvoří strukturu složek
- Zkopíruje konfigurační soubory
- Nastaví oprávnění
- Aktualizuje docker-compose.yml s cestami

**Pro koho:** Automatizace setupu na NAS přes SSH

---

## 📦 Package soubory

### `package.json`
- Závislosti projektu
- NPM skripty (start, build, test)
- React + Ionic + Bootstrap

### `package-lock.json`
- Zamčené verze závislostí

---

## 🗺️ Návod podle potřeby

### 🎯 Chci rychle spustit aplikaci
→ Přečtěte: **`QUICKSTART.md`**

### 🐳 Chci nastavit Portainer + nginx
→ Přečtěte: **`PORTAINER_QUICKSTART.md`** (5 min)
→ Nebo: **`PORTAINER_NGINX_SETUP.md`** (detailní)

### 📱 Chci build mobilní aplikaci
→ Přečtěte: **`README_IONIC.md`** (sekce Build)

### 🔧 Chci upravit aplikaci
→ Přečtěte: **`README_IONIC.md`** (sekce Přizpůsobení)

### 🆘 Mám problém
→ Hledejte v: **`PORTAINER_QUICKSTART.md`** (sekce Problémy)
→ Nebo: **`PORTAINER_NGINX_SETUP.md`** (sekce Troubleshooting)

### 📝 Chci vytvořit novou konfiguraci
→ Použijte: **`generate-config.js`**
→ Nebo: Ručně editujte `eon-config.json`

---

## 🔑 Klíčové soubory pro produkci

**Na NAS potřebujete:**
1. ✅ `nginx-default.conf` → `/srv/eon/nginx/default.conf`
2. ✅ `eon-config.json` → `/srv/eon/data/eon-config.json`
3. ✅ `docker-compose.yml` → Pro Portainer Stack

**V aplikaci upravte:**
1. ✅ URL serveru v nastavení (⚙️)
2. ✅ (Volitelně) Barvy v `src/App.css`
3. ✅ (Volitelně) Souřadnice počasí v `src/Weather.jsx`

---

## 📊 Statistiky

```
📁 Celkem souborů: ~25
📚 Dokumentace: 6 souborů
🔧 Konfigurační: 3 soubory
⚙️  Skripty: 2 soubory
💻 Source kód: ~10 souborů
🎨 Styly: 4 CSS soubory
```

---

## ✅ Checklist před nasazením

- [ ] Přečtena dokumentace (alespoň QUICKSTART)
- [ ] NAS server připraven
- [ ] Složky `/srv/eon/data/` a `/srv/eon/nginx/` vytvořeny
- [ ] Soubory zkopírovány na NAS
- [ ] Docker-compose.yml obsahuje správné cesty
- [ ] Stack nasazen v Portaineru
- [ ] URL testována v prohlížeči
- [ ] URL nastavena v aplikaci
- [ ] Badge ukazuje 🟢 Server
- [ ] První test aktualizace proběhl úspěšně

---

**Máte otázky?**

1. Zkontrolujte příslušnou dokumentaci
2. Zkontrolujte sekci Troubleshooting
3. Podívejte se do Portainer logů
4. Použijte diagnostické příkazy z dokumentace

---

**Šťastné topení! 🔥**
