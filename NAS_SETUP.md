# 🏠 EON Topení - Návod na nastavení NAS serveru

Tento návod vás provede nastavením OpenMediaVault NAS serveru pro dynamickou konfiguraci časů topení.

## 📋 Přehled

Aplikace funguje tak, že:
1. **Pravidelně kontroluje** (každých 5 minut) JSON soubor na vašem NAS serveru
2. **Detekuje nové verze** na základě pole `version` v JSON
3. **Nabídne aktualizaci** pokud je k dispozici nová verze
4. **Ukládá lokálně** poslední verzi pro offline režim
5. **Fallback** na výchozí data pokud není server dostupný

---

## 🔧 Nastavení OpenMediaVault

### Krok 1: Přihlášení do OpenMediaVault

1. Otevřete webové rozhraní OMV (např. `http://192.168.1.100`)
2. Přihlaste se (výchozí: admin/openmediavault)

### Krok 2: Vytvoření složky pro EON

1. Přejděte do **Storage → Shared Folders**
2. Klikněte na **Create** a vytvořte novou sdílenou složku:
   - **Name**: `eon`
   - **Device**: Vyberte váš disk
   - **Path**: `/eon/`
   - **Permissions**: `Administrator: read/write, Users: read/write, Others: read only`
3. Klikněte **Save**

### Krok 3: Povolit SMB/CIFS (volitelné, pro editaci souborů)

1. Přejděte do **Services → SMB/CIFS → Settings**
2. Zapněte službu **Enable**
3. V záložce **Shares** přidejte sdílení složky `eon`
4. Apply changes

### Krok 4: Nastavení HTTP přístupu

#### Možnost A: Použití nginx (doporučeno)

1. Přejděte do **Services → nginx**
2. Zapněte **Enable**
3. Vytvořte nový server block:

```nginx
server {
    listen 80;
    server_name nas.local;  # nebo vaše IP adresa

    location /eon/ {
        alias /srv/dev-disk-by-uuid-xxxxxxxxx/eon/;
        autoindex off;

        # Povolit CORS pro aplikaci
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept' always;

        # Cache control
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
```

4. **Důležité**: Nahraďte `dev-disk-by-uuid-xxxxxxxxx` skutečnou cestou k vašemu disku
   - Cestu najdete v **Storage → File Systems**

#### Možnost B: Použití Apache2

1. Nainstalujte Apache2 (pokud není nainstalován):
```bash
sudo apt-get update
sudo apt-get install apache2
```

2. Vytvořte konfigurační soubor `/etc/apache2/sites-available/eon.conf`:

```apache
<Directory "/srv/dev-disk-by-uuid-xxxxxxxxx/eon">
    Options -Indexes +FollowSymLinks
    AllowOverride None
    Require all granted

    # CORS headers
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</Directory>

Alias /eon /srv/dev-disk-by-uuid-xxxxxxxxx/eon
```

3. Povolit potřebné moduly a site:
```bash
sudo a2enmod headers
sudo a2ensite eon
sudo systemctl restart apache2
```

### Krok 5: Nahrání JSON konfigurace

1. Připojte se k NAS přes SMB (Windows: `\\192.168.1.100\eon`)
2. Zkopírujte soubor `eon-config.json` do složky `eon`
3. Nebo použijte SSH:

```bash
ssh root@192.168.1.100
cd /srv/dev-disk-by-uuid-xxxxxxxxx/eon/
nano eon-config.json
```

A vložte obsah:

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
    { "id": 8, "value": "ano" },
    { "id": 9, "value": "ne" },
    { "id": 10, "value": "ano" },
    { "id": 11, "value": "ano" },
    { "id": 12, "value": "ne" },
    { "id": 13, "value": "ano" },
    { "id": 14, "value": "ano" },
    { "id": 15, "value": "ano" },
    { "id": 16, "value": "ano" },
    { "id": 17, "value": "ano" },
    { "id": 18, "value": "ne" },
    { "id": 19, "value": "ano" },
    { "id": 20, "value": "ne" },
    { "id": 21, "value": "ano" },
    { "id": 22, "value": "ano" },
    { "id": 23, "value": "ano" }
  ],
  "weekend": [
    { "id": 6, "value": "ano" },
    { "id": 7, "value": "ano" },
    { "id": 8, "value": "ano" },
    { "id": 9, "value": "ne" },
    { "id": 10, "value": "ano" },
    { "id": 11, "value": "ne" },
    { "id": 12, "value": "ano" },
    { "id": 13, "value": "ano" },
    { "id": 14, "value": "ano" },
    { "id": 15, "value": "ano" },
    { "id": 16, "value": "ano" },
    { "id": 17, "value": "ne" },
    { "id": 18, "value": "ano" },
    { "id": 19, "value": "ne" },
    { "id": 20, "value": "ano" },
    { "id": 21, "value": "ano" },
    { "id": 22, "value": "ano" },
    { "id": 23, "value": "ano" }
  ]
}
```

### Krok 6: Ověření přístupu

Otevřete prohlížeč a zkuste načíst:
```
http://192.168.1.100/eon/eon-config.json
```

Měli byste vidět JSON konfiguraci.

---

## 📱 Nastavení aplikace

### Krok 1: Otevřete aplikaci

Spusťte aplikaci EON na vašem telefonu/počítači.

### Krok 2: Otevřete nastavení

Klikněte na ikonu **⚙️** v pravém horním rohu.

### Krok 3: Nastavte URL serveru

Do pole "URL serveru (NAS)" zadejte:
```
http://192.168.1.100/eon/eon-config.json
```

**Poznámka**: Nahraďte `192.168.1.100` skutečnou IP adresou vašeho NAS serveru.

### Krok 4: Uložte a zkontrolujte

1. Klikněte **Uložit URL**
2. Klikněte **🔄 Zkontrolovat aktualizaci**
3. Pokud vše funguje, měla by se načíst konfigurace

---

## 🔄 Jak aktualizovat časy topení

### Jednoduchá metoda (6× ročně)

1. Připojte se k NAS přes SMB nebo SSH
2. Otevřete soubor `eon-config.json`
3. Upravte časy topení (hodnoty "ano"/"ne")
4. **Důležité**: Změňte pole `version` na novou hodnotu (např. aktuální datum/čas):
   ```json
   "version": "2024-11-15T10:30:00Z"
   ```
5. Změňte `lastUpdated` na aktuální čas
6. Volitelně upravte `validFrom` a `validTo`
7. Uložte soubor

Aplikace automaticky detekuje změnu během 5 minut a nabídne aktualizaci!

### Příklad úpravy

**Před:**
```json
{
  "version": "2024-11-06T18:00:00Z",
  "weekday": [
    { "id": 6, "value": "ano" },
    { "id": 7, "value": "ano" },
    ...
  ]
}
```

**Po:**
```json
{
  "version": "2024-11-15T10:30:00Z",
  "weekday": [
    { "id": 6, "value": "ne" },    // změněno
    { "id": 7, "value": "ano" },
    ...
  ]
}
```

---

## 🌐 Vzdálený přístup (volitelné)

### Možnost 1: VPN (doporučeno)

1. Nastavte OpenVPN nebo WireGuard na vašem NAS
2. Připojte se přes VPN když jste mimo domov
3. Aplikace funguje stejně jako v lokální síti

### Možnost 2: Port Forwarding (méně bezpečné)

1. V routeru nastavte port forwarding:
   - Externí port: 8080
   - Interní IP: 192.168.1.100
   - Interní port: 80
2. V aplikaci nastavte URL:
   ```
   http://VASE_VEREJNA_IP:8080/eon/eon-config.json
   ```

**Varování**: Port forwarding může být bezpečnostní riziko. Použijte silné heslo a firewall.

---

## 🐛 Řešení problémů

### Aplikace nenačítá konfiguraci

**Zkontrolujte:**
1. Je NAS server zapnutý a dostupný?
   - Zkuste ping: `ping 192.168.1.100`
2. Je JSON dostupný přes prohlížeč?
   - Otevřete: `http://192.168.1.100/eon/eon-config.json`
3. Je URL v aplikaci správně nastavená?
   - Zkontrolujte v nastavení aplikace
4. CORS problem?
   - Ujistěte se, že máte správně nastavené CORS headers v nginx/Apache

### JSON soubor se nenačítá přes HTTP

**Zkontrolujte oprávnění:**
```bash
sudo chmod 644 /srv/dev-disk-by-uuid-xxx/eon/eon-config.json
sudo chown www-data:www-data /srv/dev-disk-by-uuid-xxx/eon/eon-config.json
```

### CORS Error v konzoli prohlížeče

Přidejte CORS headers do nginx/Apache konfigurace (viz Krok 4).

### Aplikace ukazuje "Výchozí" místo "Server"

- Aplikace nemůže kontaktovat server
- Zkontrolujte URL a dostupnost serveru
- Zkontrolujte firewall na NAS

---

## 📊 Status indikátory

V levém horním rohu aplikace vidíte status:

- **🟢 Server** - Data načtena z NAS serveru
- **🟡 Lokální** - Používá se poslední stažená verze (offline režim)
- **⚪ Výchozí** - Používá se výchozí konfigurace (nikdy se nepřipojilo k serveru)

---

## 💡 Tipy

1. **Zálohujte JSON** před úpravami
2. **Testujte JSON** před uložením: https://jsonlint.com
3. **Používejte ISO 8601** formát pro version: `YYYY-MM-DDTHH:mm:ssZ`
4. **Dokumentujte změny** v poli `description`
5. **Offline režim** - aplikace funguje i bez serveru díky localStorage

---

## 🔐 Bezpečnost

- NAS by měl být přístupný pouze z lokální sítě
- Pro vzdálený přístup používejte VPN
- Pravidelně aktualizujte OpenMediaVault
- Používejte silná hesla
- Neukládejte citlivé informace do JSON

---

## 📞 Podpora

Pokud máte problémy:
1. Zkontrolujte konzoli prohlížeče (F12) pro chybové hlášky
2. Zkontrolujte logy nginx/Apache na NAS
3. Ověřte síťové připojení

---

**Hotovo! 🎉**

Vaše EON aplikace je nyní připravena na dynamickou konfiguraci z NAS serveru.
