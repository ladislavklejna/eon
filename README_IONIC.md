# 📱 EON Topení - Ionic Aplikace

Modernizovaná aplikace pro sledování a správu topení s dynamickou konfigurací přes NAS server.

## ✨ Nové funkce

### 🔄 Dynamická konfigurace
- Časy topení se načítají z JSON souboru na vašem NAS serveru
- Automatická detekce aktualizací každých 5 minut
- Notifikace když je k dispozici nová verze
- Offline režim s localStorage fallback

### 🎨 Moderní design
- Glassmorphism efekty
- Tmavý gradient pozadí s ambient light efekty
- Plně responzivní pro mobil, tablet i desktop
- Smooth animace a transitions
- Vylepšené počasí kartičky s hover efekty

### ⚙️ Nastavení
- Konfigurovatelná URL NAS serveru
- Kontrola verzí konfigurace
- Zobrazení zdroje dat (Server/Lokální/Výchozí)
- Možnost vymazat lokální cache

## 🚀 Rychlý start

### 1. Instalace
```bash
cd eon
npm install
```

### 2. Spuštění
```bash
npm start
```

Aplikace se otevře na `http://localhost:3000`

### 3. První nastavení

1. Klikněte na ⚙️ v pravém horním rohu
2. Zadejte URL vašeho NAS serveru:
   ```
   http://192.168.1.100/eon/eon-config.json
   ```
3. Klikněte "Uložit URL"
4. Klikněte "🔄 Zkontrolovat aktualizaci"

## 📁 Struktura projektu

```
eon/
├── public/
│   └── eon-config.json          # Vzorová konfigurace
├── src/
│   ├── components/
│   │   ├── UpdateNotification.jsx  # Notifikace o aktualizaci
│   │   ├── UpdateNotification.css
│   │   ├── Settings.jsx            # Panel nastavení
│   │   └── Settings.css
│   ├── services/
│   │   └── ConfigService.js        # Služba pro načítání konfigurace
│   ├── App.js                      # Hlavní komponenta
│   ├── App.css                     # Hlavní styly
│   ├── Weather.jsx                 # Počasí komponenta
│   └── Weather.css
├── NAS_SETUP.md                    # Detailní návod pro NAS
└── README_IONIC.md                 # Tento soubor
```

## 🔧 Konfigurace NAS serveru

Viz detailní návod v [NAS_SETUP.md](./NAS_SETUP.md)

### Základní kroky:
1. Nastavte HTTP server na OpenMediaVault
2. Vytvořte složku `/eon/` a nahrajte `eon-config.json`
3. Nakonfigurujte CORS headers
4. Zadejte URL do aplikace

## 📝 JSON formát konfigurace

```json
{
  "version": "2024-11-06T18:00:00Z",
  "lastUpdated": "2024-11-06T18:00:00Z",
  "description": "Konfigurace časů topení EON",
  "validFrom": "2024-02-01",
  "validTo": "2024-04-01",
  "weekday": [
    { "id": 6, "value": "ano" },
    { "id": 7, "value": "ano" },
    ...
  ],
  "weekend": [
    { "id": 6, "value": "ano" },
    ...
  ]
}
```

### Pole:
- **version** - Verze konfigurace (ISO 8601), použito pro detekci aktualizací
- **lastUpdated** - Čas poslední úpravy
- **description** - Popis konfigurace
- **validFrom/validTo** - Platnost rozvrhu (zobrazí se v aplikaci)
- **weekday** - Rozvrh pro všední dny (Po-Pá)
- **weekend** - Rozvrh pro víkend (So-Ne)

### Hodnoty:
- **id** - Hodina (6-23)
- **value** - "ano" = topí, "ne" = netopí

## 🔄 Jak aktualizovat časy

1. Upravte `eon-config.json` na NAS
2. Změňte `version` na novou hodnotu (např. aktuální datum/čas)
3. Uložte soubor
4. Aplikace automaticky detekuje změnu do 5 minut
5. Zobrazí se notifikace s možností aktualizovat

## 📊 Status indikátory

- **🟢 Server** - Data načtena ze serveru (nejnovější)
- **🟡 Lokální** - Offline režim (poslední stažená verze)
- **⚪ Výchozí** - Výchozí data (nikdy se nepřipojilo)

## 🎨 Přizpůsobení

### Barvy
Upravte v `src/App.css`:
```css
.App {
  --green: #22c55e;      /* Barva pro "topí" */
  --red: #ef4444;        /* Barva pro "netopí" */
  --accent: #38bdf8;     /* Akcentní barva */
  --gradient-start: #0f172a;
  --gradient-end: #1e293b;
}
```

### Interval kontroly aktualizací
Upravte v `src/App.js`:
```javascript
const interval = setInterval(checkUpdate, 5 * 60 * 1000); // 5 minut
```

### URL serveru (výchozí)
Upravte v `src/services/ConfigService.js`:
```javascript
this.serverUrl = localStorage.getItem('eon_server_url') || 'http://192.168.1.100/eon/eon-config.json';
```

## 📱 Build pro produkci

### Web aplikace
```bash
npm run build
```

Výstup bude v `build/` složce.

### Ionic mobilní aplikace

1. **Přidat Capacitor:**
```bash
npm install @capacitor/cli @capacitor/core
npx cap init
```

2. **Přidat platformy:**
```bash
npx cap add android
npx cap add ios
```

3. **Build a sync:**
```bash
npm run build
npx cap sync
```

4. **Otevřít v native IDE:**
```bash
npx cap open android  # nebo ios
```

## 🐛 Řešení problémů

### CORS Error
Zkontrolujte, že máte správně nastavené CORS headers na NAS serveru.

### Nenačítá se konfigurace
1. Zkontrolujte URL v nastavení
2. Ověřte, že je JSON dostupný v prohlížeči
3. Zkontrolujte konzoli (F12) pro chybové hlášky

### Offline režim nefunguje
localStorage může být zablokován v private/incognito režimu.

## 📚 Technologie

- **React** 18.2.0
- **Ionic React** 7.x
- **Reactstrap** (Bootstrap 5)
- **React Icons**
- **Capacitor** (pro mobilní build)

## 🔐 Bezpečnost

- Používejte NAS pouze v lokální síti
- Pro vzdálený přístup použijte VPN
- Neukládejte citlivé informace do JSON
- Pravidelně aktualizujte závislosti: `npm audit fix`

## 📄 Licence

Tento projekt je vytvořen pro osobní použití.

---

**Vytvořeno s ❤️ pomocí Claude Code**
