# ⚡ Rychlý start - EON Topení

## 🎯 Za 5 minut k funkční aplikaci

### 1️⃣ Spuštění aplikace (30 sekund)

```bash
cd eon
npm start
```

Aplikace se otevře na http://localhost:3000

**Co uvidíte:**
- ⚪ Výchozí badge (používá se výchozí konfigurace)
- Progress bar s časovým plánem
- Aktuální čas a status topení
- Počasí pro vaši lokalitu

---

### 2️⃣ Otestování bez NAS (1 minuta)

Pro otestování můžete použít lokální server:

```bash
# V jiném terminálu, ve složce eon
npx serve -l 3001 public
```

Pak v aplikaci:
1. Klikněte na **⚙️** (pravý horní roh)
2. Zadejte URL: `http://localhost:3001/eon-config.json`
3. Klikněte **Uložit URL**
4. Klikněte **🔄 Zkontrolovat aktualizaci**

**Výsledek:** Badge by se měl změnit na 🟢 Server

---

### 3️⃣ Vytvoření vlastní konfigurace (2 minuty)

#### Metoda A: Pomocný skript

```bash
node generate-config.js
```

Otevřete `generate-config.js` a upravte:
```javascript
weekday: {
  6: true,   // 6:00 - topí
  7: true,   // 7:00 - topí
  8: false,  // 8:00 - NETOPÍ
  // atd...
}
```

#### Metoda B: Manuální editace

Otevřete `public/eon-config.json` a upravte hodnoty:
- `"ano"` = topí
- `"ne"` = netopí

```json
{
  "version": "2024-11-06T18:00:00Z",
  "weekday": [
    { "id": 6, "value": "ano" },    // 6:00 topí
    { "id": 7, "value": "ne" },     // 7:00 netopí
    ...
  ]
}
```

**Důležité:** Vždy změňte `version` při úpravě!

---

### 4️⃣ Testování aktualizace (1 minuta)

1. Upravte `public/eon-config.json`
2. Změňte `version` na novou hodnotu:
   ```json
   "version": "2024-11-06T19:00:00Z"
   ```
3. Počkejte max 30 sekund
4. Měla by se zobrazit notifikace o aktualizaci!

---

## 🏠 Nastavení s NAS serverem

### Rychlé kroky:

1. **Na NAS:**
   - Vytvořte složku `/eon/`
   - Zkopírujte `eon-config.json` do ní
   - Nastavte HTTP přístup (nginx/Apache)

2. **V aplikaci:**
   - Nastavení → URL: `http://192.168.1.100/eon/eon-config.json`
   - Uložit → Zkontrolovat aktualizaci

Detaily viz [NAS_SETUP.md](./NAS_SETUP.md)

---

## 📱 Build pro mobil

### Android:

```bash
npm install @capacitor/cli @capacitor/core @capacitor/android
npx cap init
npx cap add android
npm run build
npx cap sync
npx cap open android
```

### iOS:

```bash
npm install @capacitor/cli @capacitor/core @capacitor/ios
npx cap init
npx cap add ios
npm run build
npx cap sync
npx cap open ios
```

---

## 🎨 Přizpůsobení

### Změna barev:
Upravte `src/App.css`:
```css
.App {
  --green: #22c55e;    /* Barva pro topení */
  --red: #ef4444;      /* Barva pro netopení */
}
```

### Změna lokality počasí:
Upravte `src/Weather.jsx`:
```javascript
fetch("https://api.open-meteo.com/v1/forecast?latitude=49.50174&longitude=14.61611&...")
       // ↑ Změňte souřadnice
```

---

## 🐛 Nejčastější problémy

### ❌ "Failed to fetch"
**Řešení:**
- Zkontrolujte URL v nastavení
- Ověřte, že server běží
- Zkontrolujte CORS (viz NAS_SETUP.md)

### ❌ Badge stále ukazuje "Výchozí"
**Řešení:**
- Zkontrolujte konzoli (F12) pro chyby
- Ověřte formát JSON na https://jsonlint.com
- Zkuste vymazat cache (Nastavení → Vymazat lokální data)

### ❌ Notifikace o aktualizaci se nezobrazuje
**Řešení:**
- Zkontrolujte, že jste změnili `version` v JSON
- Počkejte 30 sekund (první kontrola)
- Ručně: Nastavení → Zkontrolovat aktualizaci

---

## 📚 Další materiály

- **Kompletní dokumentace:** [README_IONIC.md](./README_IONIC.md)
- **NAS nastavení:** [NAS_SETUP.md](./NAS_SETUP.md)
- **Generator konfigurace:** `node generate-config.js`

---

## ✅ Checklist

- [ ] Aplikace běží na localhost:3000
- [ ] Badge ukazuje status (zelený = server)
- [ ] Zobrazuje se aktuální čas
- [ ] Počasí se načítá
- [ ] Nastavení se otevírá
- [ ] Aktualizace funguje

---

**Hotovo! Užívejte si aplikaci! 🎉**

Pro produkční nasazení pokračujte s [NAS_SETUP.md](./NAS_SETUP.md)
