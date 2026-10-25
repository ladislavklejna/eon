#!/bin/bash
# Skript pro generování self-signed SSL certifikátů pro EON nginx
#
# Použití:
# 1. Zkopírujte na váš NAS server
# 2. Spusťte: bash generate-ssl-cert.sh

set -e

echo "🔐 Generování SSL certifikátů pro EON nginx..."
echo ""

# Definice výstupní složky - ZMĚŇTE NA VAŠI CESTU!
CERT_DIR="/srv/dev-disk-by-uuid-XXXXXXX/eon/nginx/ssl"
DAYS_VALID=3650  # 10 let

# Vytvoření složky pro certifikáty
echo "📁 Vytvářím složku pro certifikáty..."
mkdir -p "$CERT_DIR"

# IP adresa vašeho NAS serveru - ZMĚŇTE NA VAŠI IP!
NAS_IP="10.0.1.51"

echo "🔧 Konfigurace:"
echo "   - IP adresa: $NAS_IP"
echo "   - Platnost: $DAYS_VALID dní (10 let)"
echo "   - Výstupní složka: $CERT_DIR"
echo ""

# Generování privátního klíče a certifikátu v jednom kroku
echo "🔑 Generuji privátní klíč a certifikát..."
openssl req -x509 -nodes -days $DAYS_VALID \
  -newkey rsa:2048 \
  -keyout "$CERT_DIR/nginx.key" \
  -out "$CERT_DIR/nginx.crt" \
  -subj "/C=CZ/ST=Prague/L=Prague/O=Home/OU=EON/CN=$NAS_IP" \
  -addext "subjectAltName=IP:$NAS_IP,DNS:localhost"

# Nastavení práv
chmod 644 "$CERT_DIR/nginx.crt"
chmod 600 "$CERT_DIR/nginx.key"

echo ""
echo "✅ Certifikáty byly úspěšně vytvořeny!"
echo ""
echo "📋 Soubory:"
echo "   - Certifikát: $CERT_DIR/nginx.crt"
echo "   - Privátní klíč: $CERT_DIR/nginx.key"
echo ""
echo "🔍 Informace o certifikátu:"
openssl x509 -in "$CERT_DIR/nginx.crt" -noout -subject -dates
echo ""
echo "📝 Další kroky:"
echo "   1. Aktualizujte docker-compose.yml (použijte docker-compose-https.yml)"
echo "   2. Použijte nginx-default-https.conf místo nginx-default.conf"
echo "   3. V Portaineru: Stacks → eon-nginx → Editor → Update the stack"
echo "   4. Server bude dostupný na: https://$NAS_IP:4545/eon/eon-config.json"
echo "   5. V aplikaci nastavte URL na: https://$NAS_IP:4545/eon/eon-config.json"
echo ""
echo "⚠️  DŮLEŽITÉ:"
echo "   Prohlížeč zobrazí varování 'Nezabezpečené připojení' protože je certifikát"
echo "   self-signed. To je normální pro lokální použití. Pokračujte kliknutím na"
echo "   'Pokročilé' → 'Pokračovat na stránku' (Chrome) nebo podobnou volbu."
echo ""
