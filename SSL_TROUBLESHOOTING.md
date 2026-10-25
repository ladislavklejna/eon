# SSL Troubleshooting pro EON Topení Android

## Problém: SSLHandshakeException

Při použití HTTPS se self-signed certifikáty na Android dostáváte chybu:
```
javax.net.ssl.SSLHandshakeException
```

## Příčina

Capacitor HTTP plugin (`@capacitor-community/http`) nemá vestavěnou podporu pro ignorování SSL certificate checking. I když máte správně nakonfigurovaný `network_security_config.xml`, plugin stále ověřuje certifikáty podle svých vlastních pravidel.

## ✅ Řešení 1: Použít HTTP místo HTTPS (DOPORUČENO)

Pro lokální síť je **HTTP zcela bezpečné** a je nejjednodušším řešením.

### Krok 1: Změňte server URL

V aplikaci Settings změňte URL z:
```
https://10.0.1.51:4545/data/eon-config.json
```

na:
```
http://10.0.1.51:8080/eon/eon-config.json
```

### Krok 2: Ujistěte se, že váš nginx běží na HTTP portu

V `docker-compose.yml`:
```yaml
services:
  eon-nginx:
    image: nginx:alpine
    ports:
      - "8080:80"  # HTTP port
```

### Krok 3: Rebuild aplikace

```bash
npm run build
npx cap sync android
npx cap open android
```

Poté v Android Studio: Build → Build APK(s)

## 🔐 Řešení 2: Instalovat self-signed certifikát do Android zařízení

Pokud **musíte** používat HTTPS:

### Krok 1: Export certifikátu z NAS serveru

```bash
# Na NAS serveru
openssl s_client -connect 10.0.1.51:4545 -showcerts < /dev/null | \
  openssl x509 -outform PEM > eon-nas-cert.pem
```

### Krok 2: Převod do formátu .crt

```bash
openssl x509 -in eon-nas-cert.pem -out eon-nas-cert.crt
```

### Krok 3: Instalace na Android zařízení

1. Zkopírujte `eon-nas-cert.crt` do telefonu (přes USB nebo email)
2. Na Androidu: **Settings → Security → Encryption & credentials → Install a certificate → CA certificate**
3. Vyberte soubor `eon-nas-cert.crt`
4. Pojmenujte ho např. "EON NAS Server"
5. Potvrďte instalaci

### Krok 4: Restart aplikace

Po instalaci certifikátu by měla aplikace fungovat s HTTPS.

## 🛠️ Řešení 3: Použít validní SSL certifikát (Let's Encrypt)

Pro produkční nasazení použijte certifikát od Let's Encrypt:

1. Zajistěte, aby váš NAS měl veřejnou doménu (např. `eon.yourdomain.com`)
2. Použijte certbot pro získání certifikátu
3. Nakonfigurujte nginx pro použití Let's Encrypt certifikátu

## Testování

### Test HTTP připojení

```bash
# Z telefonu nebo počítače ve stejné síti
curl -v http://10.0.1.51:8080/eon/eon-config.json
```

Měli byste vidět JSON odpověď s konfigurací.

### Test HTTPS připojení

```bash
# Tento příkaz ukáže SSL handshake problémy
curl -v https://10.0.1.51:4545/data/eon-config.json
```

## Kontrolní seznam

- [ ] Network Security Config je správně nakonfigurován v `android/app/src/main/res/xml/network_security_config.xml`
- [ ] AndroidManifest.xml odkazuje na network security config
- [ ] Server běží a je dostupný ze stejné sítě
- [ ] URL v aplikaci Settings je správně nastavená (HTTP nebo HTTPS)
- [ ] Pokud používáte HTTPS, certifikát je nainstalován v Android zařízení

## Ladění

### Zobrazit logy v Android Studio

1. Otevřete Android Studio
2. Spusťte aplikaci přes `npx cap run android`
3. Otevřete **Logcat** (View → Tool Windows → Logcat)
4. Filtrujte podle "eon" nebo "ConfigService"
5. Sledujte chybové zprávy při pokusu o načtení konfigurace

### Testovat konektivitu v aplikaci

V aplikaci:
1. Klikněte na **Settings** (⚙️)
2. Zadejte testovací URL
3. Klikněte **Check for Update**
4. Badge by měl ukázat "Server" (zelený) pokud vše funguje

## Doporučené nastavení pro produkci

1. **Development (lokální síť):** HTTP na portu 8080
2. **Production (veřejný přístup):** HTTPS s Let's Encrypt certifikátem
3. **Pro maximální kompatibilitu:** Vždy používejte HTTP v lokální síti

## Další informace

- Network Security Config dokumentace: https://developer.android.com/training/articles/security-config
- Capacitor HTTP plugin: https://github.com/capacitor-community/http
- Let's Encrypt certbot: https://certbot.eff.org/
