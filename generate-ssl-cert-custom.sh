#!/bin/bash
# Skript pro generování self-signed SSL certifikátů pro EON nginx
# Verze pro UUID: 4997f047-4988-4230-8d8c-9fc20698becd
#
# Použití:
# 1. Zkopírujte na váš NAS server
# 2. Spusťte: bash generate-ssl-cert-custom.sh

set -e

echo "🔐 Generování SSL certifikátů pro EON nginx..."
echo ""

# Definice výstupní složky - VAŠE KONKRÉTNÍ CESTA
CERT_DIR="/srv/dev-disk-by-uuid-4997f047-4988-4230-8d8c-9fc20698becd/eon/nginx/ssl"
DAYS_VALID=3650  # 10 let

# Vytvoření složky pro certifikáty
echo "📁 Vytvářím složku pro certifikáty..."
mkdir -p "$CERT_DIR"

# IP adresa vašeho NAS serveru
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
echo "   1. Vytvořte default.conf v /srv/dev-disk-by-uuid-4997f047-4988-4230-8d8c-9fc20698becd/eon/nginx/"
echo "   2. Aktualizujte docker-compose.yml v Portaineru"
echo "   3. V Portaineru: Stacks → eon-nginx → Editor → Update the stack"
echo "   4. Server bude dostupný na: https://$NAS_IP:4545/eon/eon-config.json"
echo ""
echo "⚠️  DŮLEŽITÉ:"
echo "   Prohlížeč zobrazí varování protože je certifikát self-signed."
echo "   To je normální - klikněte 'Pokročilé' → 'Pokračovat'."
echo ""
