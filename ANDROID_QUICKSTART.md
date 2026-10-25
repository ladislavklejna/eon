# ⚡ Android APK - Rychlý start (30 minut)

Nejrychlejší způsob, jak vytvořit Android aplikaci z vaší EON web aplikace.

---

## ✅ Před začátkem

1. **Stáhněte Android Studio:** https://developer.android.com/studio
2. **Nainstalujte ho** (klikejte Next, Next, Finish... zabere ~10 min)

---

## 🚀 5 příkazů k APK

```bash
# 1. Instalace dependencies (2 min)
npm install

# 2. Přidání Android platformy (1 min)
npx cap add android

# 3. Nastavení SSL certifikátů (10 sekund) - WINDOWS
.\setup-android-security.ps1

# 4. Build React aplikace (1 min)
npm run build

# 5. Synchronizace (30 sekund)
npx cap sync android
```

---

## 📱 Vytvoření APK

```bash
# Otevře Android Studio:
npx cap open android
```

**V Android Studio:**
1. Počkejte na dokončení indexování (první spuštění ~5 min)
2. Klikněte: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Počkejte ~2-3 minuty
4. Klikněte **"locate"** v notifikaci
5. Máte APK! 🎉

**APK najdete zde:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📲 Instalace na telefon

**Metoda 1: USB kabel**
1. Připojte telefon
2. V Android Studio: Zelená šipka **Run ▶**
3. Vyberte váš telefon
4. Hotovo!

**Metoda 2: Soubor APK**
1. Zkopírujte `app-debug.apk` na telefon (email, USB, airdrop...)
2. Na telefonu: Otevřete soubor
3. Potvrďte instalaci
4. Hotovo!

---

## ⚙️ První nastavení v aplikaci

1. Otevřete aplikaci na telefonu
2. Klikněte ⚙️
3. Zadejte: `https://10.0.1.51:4545/eon/eon-config.json`
4. Uložte
5. Zkontrolujte aktualizaci
6. Badge by měl ukazovat: 🟢 Server

---

## ✅ Hotovo!

Vaše Android aplikace:
- ✅ Funguje s HTTPS self-signed certifikátem
- ✅ Načítá data z NAS serveru
- ✅ Offline režim (cached data)
- ✅ Automatická detekce aktualizací

---

## 🔄 Jak udělat update aplikace?

```bash
# 1. Změňte kód v React aplikaci
# 2. Build:
npm run build && npx cap sync android

# 3. Otevřete Android Studio:
npx cap open android

# 4. Build → Build APK(s)
# 5. Distribuujte nové APK
```

---

## 💡 Tipy

**Změna IP adresy serveru:**
```
Upravte: android/app/src/main/res/xml/network_security_config.xml
Změňte: 10.0.1.51 → vaše IP
```

**Podrobný návod:**
Přečtěte si: `ANDROID_BUILD_GUIDE.md`

**Problémy?**
Nejčastější problémy a řešení jsou v `ANDROID_BUILD_GUIDE.md`

---

**První build hotový za 30 minut! 🎉**
