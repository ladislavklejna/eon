#!/usr/bin/env node

/**
 * Pomocný skript pro generování JSON konfigurace topení
 *
 * Použití:
 * node generate-config.js
 *
 * Nebo přímo editujte hodnoty níže a spusťte
 */

const fs = require('fs');
const path = require('path');

// KONFIGURACE - UPRAVTE DLE POTŘEBY
const config = {
  // Aktuální datum jako verze
  version: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  description: "Konfigurace časů topení EON",
  validFrom: "2024-11-01",
  validTo: "2025-04-30",

  // Všední dny (Po-Pá): true = topí, false = netopí
  weekday: {
    6: true,   // 6:00
    7: true,   // 7:00
    8: true,   // 8:00
    9: false,  // 9:00
    10: true,  // 10:00
    11: true,  // 11:00
    12: false, // 12:00
    13: true,  // 13:00
    14: true,  // 14:00
    15: true,  // 15:00
    16: true,  // 16:00
    17: true,  // 17:00
    18: false, // 18:00
    19: true,  // 19:00
    20: false, // 20:00
    21: true,  // 21:00
    22: true,  // 22:00
    23: true   // 23:00
  },

  // Víkend (So-Ne): true = topí, false = netopí
  weekend: {
    6: true,   // 6:00
    7: true,   // 7:00
    8: true,   // 8:00
    9: false,  // 9:00
    10: true,  // 10:00
    11: false, // 11:00
    12: true,  // 12:00
    13: true,  // 13:00
    14: true,  // 14:00
    15: true,  // 15:00
    16: true,  // 16:00
    17: false, // 17:00
    18: true,  // 18:00
    19: false, // 19:00
    20: true,  // 20:00
    21: true,  // 21:00
    22: true,  // 22:00
    23: true   // 23:00
  }
};

// Převod objektu na pole formátu [{id: 6, value: "ano"}, ...]
function convertToArray(obj) {
  return Object.entries(obj).map(([id, heating]) => ({
    id: parseInt(id),
    value: heating ? "ano" : "ne"
  }));
}

// Vytvoření finální konfigurace
const finalConfig = {
  version: config.version,
  lastUpdated: config.lastUpdated,
  description: config.description,
  validFrom: config.validFrom,
  validTo: config.validTo,
  weekday: convertToArray(config.weekday),
  weekend: convertToArray(config.weekend)
};

// Cesta k výstupnímu souboru
const outputPath = path.join(__dirname, 'public', 'eon-config.json');

// Zápis do souboru
fs.writeFileSync(outputPath, JSON.stringify(finalConfig, null, 2), 'utf-8');

console.log('✅ Konfigurace úspěšně vygenerována!');
console.log(`📁 Soubor: ${outputPath}`);
console.log(`📅 Verze: ${finalConfig.version}`);
console.log(`📅 Platnost: ${finalConfig.validFrom} - ${finalConfig.validTo}`);
console.log('');
console.log('🚀 Nyní můžete:');
console.log('1. Zkopírovat soubor na váš NAS server');
console.log('2. Nebo použít tento soubor pro testování lokálně');
console.log('');
console.log('💡 Tip: Pro vytvoření nové verze znovu spusťte tento skript');
console.log('   (automaticky se vytvoří nová verze s aktuálním časem)');

// Výpis přehledu
console.log('');
console.log('📊 Přehled nastavení:');
console.log('');
console.log('VŠEDNÍ DNY (Po-Pá):');
Object.entries(config.weekday).forEach(([hour, heating]) => {
  const icon = heating ? '🔥' : '❄️';
  const status = heating ? 'TOPÍ' : 'NETOPÍ';
  console.log(`  ${icon} ${hour}:00 - ${status}`);
});

console.log('');
console.log('VÍKEND (So-Ne):');
Object.entries(config.weekend).forEach(([hour, heating]) => {
  const icon = heating ? '🔥' : '❄️';
  const status = heating ? 'TOPÍ' : 'NETOPÍ';
  console.log(`  ${icon} ${hour}:00 - ${status}`);
});
