# 📱 EON Android Aplikace - Build Guide

Kompletní návod, jak vytvořit nativní Android aplikaci z vaší EON React aplikace.

---

## 📋 Co budete potřebovat

**Software:**
- ✅ Node.js 16+ (už máte)
- ✅ Android Studio (stáhnout: https://developer.android.com/studio)
- ✅ Java JDK 17+ (nainstaluje se s Android Studio)

**Čas:**
- První build: ~30 minut (včetně stažení Android Studio)
- Další buildy: ~5 minut

---

## 🚀 Krok za krokem

### 1️⃣ Instalace dependencies (2 min)

```bash
cd C:\Users\ladis\Desktop\EON\eon

# Nainstalujte nové dependencies:
npm install
```

**Co se nainstaluje:**
- `@capacitor/cli` - Capacitor příkazový řádek
- `@capacitor/android` - Android platforma

---

### 2️⃣ Inicializace Android platformy (3 min)

```bash
# Vytvořte Android projekt:
npx cap add android
```

**Co to udělá:**
- Vytvoří složku `android/` s nativním Android projektem
- Nastaví základní konfiguraci

---

### 3️⃣ Nastavení Network Security Config (2 min)

**Windows (PowerShell):**
```powershell
# Spusťte PowerShell skript:
.\setup-android-security.ps1
```

**Linux/Mac:**
```bash
bash setup-android-security.sh
```

**Co to udělá:**
- Zkopíruje `network_security_config.xml` do Android projektu
- Upraví `AndroidManifest.xml` pro podporu self-signed certifikátů
- Povolí načítání dat z `https://10.0.1.51:4545`

**Pokud máte JINOU IP adresu NAS serveru:**
```bash
# Upravte soubor:
notepad android\app\src\main\res\xml\network_security_config.xml

# Změňte řádek:
<domain includeSubdomains="false">10.0.1.51</domain>
# Na vaši IP, např:
<domain includeSubdomains="false">192.168.1.100</domain>
```

---

### 4️⃣ Build React aplikace (1 min)

```bash
# Vytvořte production build:
npm run build
```

**Co to udělá:**
- Vytvoří optimalizovanou verzi aplikace ve složce `build/`

---

### 5️⃣ Synchronizace s Android (1 min)

```bash
# Zkopíruje build do Android projektu:
npx cap sync android
```

**Co to udělá:**
- Zkopíruje `build/` do Android projektu
- Synchronizuje konfigurace

---

### 6️⃣ Otevření v Android Studio (2 min)

```bash
# Otevře Android Studio:
npx cap open android
```

**Při prvním spuštění:**
- Android Studio si stáhne potřebné SDK komponenty (může trvat 5-10 min)
- Klikněte "Trust Project"

---

### 7️⃣ Build APK v Android Studio (5 min)

**Debug APK (pro testování):**
1. V Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Počkejte na dokončení buildu (~2-3 min při prvním buildu)
3. Po dokončení: Klikněte **"locate"** v notifikaci
4. APK najdete v: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK (produkční verze):**
1. **Build → Generate Signed Bundle / APK**
2. Vyberte: **APK**
3. Pokud nemáte signing key:
   - Klikněte **"Create new..."**
   - Vyplňte údaje (pamatujte si heslo!)
   - Uložte keystore soubor (důležité pro budoucí updaty!)
4. Build Variants: **release**
5. APK najdete v: `android/app/build/outputs/apk/release/app-release.apk`

---

### 8️⃣ Instalace APK na telefon

**Metoda A: Přes USB kabel**
1. Na telefonu: **Nastavení → O telefonu → Klikněte 7× na "Číslo sestavení"** (aktivuje vývojářský režim)
2. **Nastavení → Možnosti pro vývojáře → Povolit ladění USB**
3. Připojte telefon k PC kabelem
4. V Android Studio: Klikněte **Run** (zelená šipka)
5. Vyberte váš telefon ze seznamu

**Metoda B: Přes soubor APK**
1. Zkopírujte `app-debug.apk` nebo `app-release.apk` na telefon
2. Na telefonu: Otevřete soubor v průzkumníku
3. Potvrďte instalaci (možná budete muset povolit "Neznámé zdroje")

---

## ✅ Testování aplikace

### První spuštění:
1. **Otevřete aplikaci**
2. **Klikněte ⚙️ (Nastavení)**
3. **Zadejte URL serveru:** `https://10.0.1.51:4545/eon/eon-config.json`
4. **Uložte**
5. **Zkontrolujte aktualizaci**

### Očekávané chování:

**V domácí WiFi síti (10.0.1.x):**
- ✅ Badge: 🟢 Server
- ✅ Data se načtou ze serveru
- ✅ Self-signed certifikát funguje (díky network security config)

**Mimo domov (mobilní data):**
- ✅ Badge: 🟡 Lokální
- ✅ Použijí se cached data z localStorage
- ✅ Aplikace funguje offline

**Detekce změn:**
- ✅ Při každém otevření aplikace zkontroluje verzi
- ✅ Pokud je nová verze, automaticky stáhne
- ✅ Badge se aktualizuje

---

## 🔄 Workflow pro aktualizace

Když změníte kód React aplikace:

```bash
# 1. Build
npm run build

# 2. Sync do Androidu
npx cap sync android

# 3. Otevřete Android Studio (pokud už není otevřené)
npx cap open android

# 4. V Android Studio: Build → Build APK(s)
```

---

## 🐛 Řešení problémů

### ❌ "SDK not found"
```
Řešení: V Android Studio:
Tools → SDK Manager → Install Android SDK 34
```

### ❌ "Gradle build failed"
```bash
# Vyčistěte build:
cd android
.\gradlew clean
cd ..

# Zkuste znovu:
npx cap sync android
```

### ❌ "Network request failed" v aplikaci
```
1. Zkontrolujte, že jste ve stejné WiFi síti jako NAS
2. Otevřete prohlížeč na telefonu a jděte na:
   https://10.0.1.51:4545/eon/eon-config.json
3. Pokud nefunguje, zkontrolujte:
   - NAS server běží
   - Nginx kontejner běží
   - Firewall na NAS povoluje port 4545
```

### ❌ "SSL handshake failed"
```
Zkontrolujte network_security_config.xml:
- Má správnou IP adresu?
- Je soubor zkopírovaný v android/app/src/main/res/xml/?
- Je správně nastavený v AndroidManifest.xml?
```

### ❌ Aplikace se nespustí na telefonu
```
1. Zkontrolujte minimum Android verzi:
   - Otevřete: android/app/build.gradle
   - Najděte: minSdkVersion
   - Mělo by být: 22 (Android 5.1+)

2. Zkontrolujte target SDK:
   - targetSdkVersion: 34 (Android 14)
```

---

## 📊 Výhody nativní aplikace vs. web

| Funkce | Web (Netlify) | Android APK |
|--------|--------------|-------------|
| **Mixed Content** | ❌ Blokováno | ✅ Funguje |
| **Self-signed cert** | ❌ Varování | ✅ Povoleno |
| **Offline režim** | ⚠️ Omezený | ✅ Plný |
| **Rychlost** | 🟡 Závisí na síti | 🟢 Rychlejší |
| **Ikona na ploše** | ⚠️ PWA | ✅ Native |
| **Automatické updaty** | ✅ Ano | ⚠️ Musíte distribuovat nové APK |
| **Instalace** | ✅ Jen URL | ⚠️ Stažení APK |

---

## 🎯 Distribuce aplikace

### Metoda 1: Přímá distribuce (nejjednodušší)
1. Nahrajte APK na váš NAS nebo cloud (Google Drive, Dropbox)
2. Pošlete link rodině
3. Každý si stáhne a nainstaluje

**Výhody:** Jednoduché, rychlé
**Nevýhody:** Musíte manuálně distribuovat updaty

### Metoda 2: Google Play Store (pokročilé)
1. Vytvoření Google Play Developer účtu ($25 jednorázově)
2. Upload signed APK/AAB
3. Automatické updaty přes Play Store

**Výhody:** Profesionální, automatické updaty
**Nevýhody:** Poplatek, review process

---

## 💡 Tipy

### Změna názvu aplikace:
```bash
# Upravte:
notepad capacitor.config.ts

# Změňte řádek:
appName: 'EON Topení',  // Na cokoliv chcete
```

### Změna ikony aplikace:
1. Vytvořte ikonu 1024×1024 px (PNG)
2. Použijte: https://icon.kitchen/
3. Stáhněte Android assets
4. Zkopírujte do: `android/app/src/main/res/`

### Změna splash screen:
1. Upravte: `android/app/src/main/res/values/styles.xml`
2. Přidejte vlastní splash screen image

### Debug přes Chrome DevTools:
1. Připojte telefon přes USB
2. V Chrome: `chrome://inspect`
3. Klikněte "inspect" pod vaší aplikací
4. Vidíte console.log() a můžete debugovat!

---

## 📞 Rychlá reference

```bash
# Full rebuild workflow:
npm run build && npx cap sync android && npx cap open android

# Jen sync (bez rebuild React):
npx cap sync android

# Otevřít Android Studio:
npx cap open android

# Live reload (pro vývoj):
npx cap run android -l --external

# Vyčistit vše:
cd android && .\gradlew clean && cd ..
```

---

## 🎓 Co se stalo?

### Před (Web):
```
React App (Netlify HTTPS)
    ↓ fetch()
    ❌ Mixed Content Error
NAS Server (HTTP nebo self-signed HTTPS)
```

### Po (Android APK):
```
React App (Native Android)
    ↓ fetch() s network_security_config.xml
    ✅ Funguje!
NAS Server (HTTPS self-signed cert)
```

**Klíčové rozdíly:**
1. ✅ Android není prohlížeč → žádná mixed content omezení
2. ✅ Network Security Config povoluje self-signed certs
3. ✅ Lepší offline podpora
4. ✅ Native pocit (ikona, splash screen, atd.)

---

**Hotovo! 🎉**

Teď máte nativní Android aplikaci, která funguje s vaším HTTPS NAS serverem (i se self-signed certifikátem)!

Další otázky? Ptejte se! 😊
