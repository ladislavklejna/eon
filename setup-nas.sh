#!/bin/bash

# EON Setup Script pro OpenMediaVault/NAS
# Tento skript vytvoří potřebnou strukturu složek a zkopíruje konfigurační soubory

echo "🚀 EON NAS Setup Script"
echo "======================="
echo ""

# Barvy pro výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funkce pro kontrolu root práv
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}❌ Tento skript musí být spuštěn jako root${NC}"
        echo "Použijte: sudo bash setup-nas.sh"
        exit 1
    fi
}

# Funkce pro dotaz na cestu
get_base_path() {
    echo -e "${YELLOW}📁 Zadejte základní cestu k vašemu NAS disku:${NC}"
    echo "Příklad: /srv/dev-disk-by-uuid-xxxxx"
    echo "Nebo stiskněte Enter pro výchozí: /srv/eon"
    read -p "Cesta: " BASE_PATH

    if [ -z "$BASE_PATH" ]; then
        BASE_PATH="/srv/eon"
    fi

    echo ""
    echo -e "Použiju cestu: ${GREEN}$BASE_PATH${NC}"
    echo ""
    read -p "Je to správně? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Zrušeno."
        exit 1
    fi
}

# Funkce pro vytvoření struktury složek
create_structure() {
    echo ""
    echo "📂 Vytvářím strukturu složek..."

    mkdir -p "$BASE_PATH/eon/data"
    mkdir -p "$BASE_PATH/eon/nginx"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Složky vytvořeny${NC}"
    else
        echo -e "${RED}❌ Chyba při vytváření složek${NC}"
        exit 1
    fi
}

# Funkce pro zkopírování konfiguračních souborů
copy_configs() {
    echo ""
    echo "📄 Kopíruji konfigurační soubory..."

    # Zkopírovat nginx config
    if [ -f "nginx-default.conf" ]; then
        cp nginx-default.conf "$BASE_PATH/eon/nginx/default.conf"
        echo -e "${GREEN}✅ Nginx konfigurace zkopírována${NC}"
    else
        echo -e "${YELLOW}⚠️  nginx-default.conf nenalezen, přeskakuji${NC}"
    fi

    # Zkopírovat eon-config.json
    if [ -f "public/eon-config.json" ]; then
        cp public/eon-config.json "$BASE_PATH/eon/data/eon-config.json"
        echo -e "${GREEN}✅ EON konfigurace zkopírována${NC}"
    else
        echo -e "${YELLOW}⚠️  public/eon-config.json nenalezen, vytvářím vzorový soubor${NC}"
        cat > "$BASE_PATH/eon/data/eon-config.json" <<EOF
{
  "version": "$(date -Iseconds)",
  "lastUpdated": "$(date -Iseconds)",
  "description": "Konfigurace časů topení EON",
  "validFrom": "2024-11-01",
  "validTo": "2025-04-30",
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
EOF
        echo -e "${GREEN}✅ Vzorový config vytvořen${NC}"
    fi
}

# Funkce pro nastavení oprávnění
set_permissions() {
    echo ""
    echo "🔐 Nastavuji oprávnění..."

    chmod -R 755 "$BASE_PATH/eon"
    chmod 644 "$BASE_PATH/eon/nginx/default.conf" 2>/dev/null
    chmod 644 "$BASE_PATH/eon/data/eon-config.json" 2>/dev/null

    # Pokud existuje www-data uživatel (pro nginx)
    if id "www-data" &>/dev/null; then
        chown -R www-data:www-data "$BASE_PATH/eon/data"
        echo -e "${GREEN}✅ Vlastník nastaven na www-data${NC}"
    else
        echo -e "${YELLOW}⚠️  Uživatel www-data neexistuje, přeskakuji${NC}"
    fi

    echo -e "${GREEN}✅ Oprávnění nastavena${NC}"
}

# Funkce pro aktualizaci docker-compose.yml
update_docker_compose() {
    echo ""
    echo "🐳 Chcete aktualizovat docker-compose.yml s novou cestou?"
    read -p "(y/n) " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f "docker-compose.yml" ]; then
            # Záloha
            cp docker-compose.yml docker-compose.yml.backup
            echo -e "${GREEN}✅ Záloha docker-compose.yml vytvořena${NC}"

            # Náhrada cesty (pro Linux sed)
            sed -i "s|/srv/dev-disk-by-uuid-XXXXXXX/|$BASE_PATH/|g" docker-compose.yml
            echo -e "${GREEN}✅ docker-compose.yml aktualizován${NC}"
            echo -e "${YELLOW}📋 Můžete ho nyní zkopírovat do Portainer Stack${NC}"
        else
            echo -e "${YELLOW}⚠️  docker-compose.yml nenalezen${NC}"
        fi
    fi
}

# Funkce pro výpis shrnutí
print_summary() {
    echo ""
    echo "======================================"
    echo -e "${GREEN}✅ Setup dokončen!${NC}"
    echo "======================================"
    echo ""
    echo "📁 Struktura vytvořena v:"
    echo "   $BASE_PATH/eon/"
    echo ""
    echo "📋 Další kroky:"
    echo "   1. Otevřete Portainer na http://YOUR-NAS-IP:9000"
    echo "   2. Vytvořte nový Stack (Stacks → Add stack)"
    echo "   3. Zkopírujte obsah docker-compose.yml"
    echo "   4. Deploy the stack"
    echo ""
    echo "🌐 Po spuštění kontejneru testujte:"
    echo "   http://YOUR-NAS-IP:8080/eon/eon-config.json"
    echo ""
    echo "⚙️  V aplikaci nastavte URL serveru:"
    echo "   http://YOUR-NAS-IP:8080/eon/eon-config.json"
    echo ""
    echo "📚 Více informací v PORTAINER_NGINX_SETUP.md"
    echo ""
}

# Hlavní program
main() {
    check_root
    echo ""
    echo "Tento skript vytvoří potřebnou strukturu pro EON topení."
    echo ""

    get_base_path
    create_structure
    copy_configs
    set_permissions
    update_docker_compose
    print_summary
}

# Spuštění
main
