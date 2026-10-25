#!/bin/bash
# Skript pro automatické nastavení Network Security Config pro Android
#
# POUŽITÍ:
# 1. Nejdřív inicializujte Android: npx cap add android
# 2. Pak spusťte tento skript: bash setup-android-security.sh

set -e

echo "🔧 Nastavuji Android Network Security Config..."

# Kontrola, že Android složka existuje
if [ ! -d "android" ]; then
    echo "❌ Chyba: Složka 'android' neexistuje!"
    echo "   Nejdřív spusťte: npx cap add android"
    exit 1
fi

# Vytvoření xml složky, pokud neexistuje
XML_DIR="android/app/src/main/res/xml"
mkdir -p "$XML_DIR"

# Zkopírování network security config
echo "📁 Kopíruji network_security_config.xml..."
cp android-network-security-config.xml "$XML_DIR/network_security_config.xml"

# Úprava AndroidManifest.xml
MANIFEST="android/app/src/main/AndroidManifest.xml"

if [ -f "$MANIFEST" ]; then
    echo "📝 Aktualizuji AndroidManifest.xml..."

    # Kontrola, jestli už network security config není nastavený
    if grep -q "android:networkSecurityConfig" "$MANIFEST"; then
        echo "✅ AndroidManifest.xml už obsahuje networkSecurityConfig"
    else
        # Přidání network security config do application tagu
        # Hledáme <application a přidáme attribute
        sed -i 's/<application/<application\n        android:networkSecurityConfig="@xml\/network_security_config"/' "$MANIFEST"
        echo "✅ Přidán networkSecurityConfig do AndroidManifest.xml"
    fi
else
    echo "❌ AndroidManifest.xml nenalezen!"
    exit 1
fi

echo ""
echo "✅ Android Network Security Config byl úspěšně nastaven!"
echo ""
echo "📋 Další kroky:"
echo "   1. Zkontrolujte IP adresu v: $XML_DIR/network_security_config.xml"
echo "   2. Pokud vaše NAS IP není 10.0.1.51, změňte ji"
echo "   3. Spusťte build: npm run build && npx cap sync"
echo "   4. Otevřete Android Studio: npx cap open android"
echo ""
