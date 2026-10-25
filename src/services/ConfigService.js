/**
 * ConfigService - služba pro načítání konfigurace topení z NAS serveru
 *
 * Funkce:
 * - Načítá JSON konfiguraci ze vzdáleného serveru
 * - Ukládá data do localStorage pro offline režim
 * - Kontroluje verze a detekuje aktualizace
 * - Poskytuje fallback na výchozí data
 */

import { Capacitor } from "@capacitor/core";
import { HTTP } from "@awesome-cordova-plugins/http";

import data from "../data";
import dataWeekend from "../dataWeekend";

const STORAGE_KEY = "eon_config";
const STORAGE_VERSION_KEY = "eon_config_version";
const STORAGE_TIMESTAMP_KEY = "eon_config_timestamp";

class ConfigService {
  constructor() {
    // URL vašeho NAS serveru - ZMĚŇTE NA VAŠI IP ADRESU
    // Příklady:
    // https://10.0.1.51:4545/data/eon-config.json (HTTPS s self-signed cert)
    // http://192.168.1.100:8080/eon/eon-config.json (HTTP alternativa)
    //
    // ✅ HTTPS s self-signed certifikáty funguje díky advanced-http plugin
    // Plugin automaticky ignoruje SSL verifikaci (setServerTrustMode('nocheck'))
    this.serverUrl =
      localStorage.getItem("eon_server_url") ||
      "https://10.0.1.51:4545/data/eon-config.json";
    console.log("=== ConfigService initialized ===");
    console.log("Default server URL:", this.serverUrl);
    console.log(
      "URL from localStorage:",
      localStorage.getItem("eon_server_url")
    );
  }

  /**
   * Diagnostická funkce pro testování dostupnosti serveru
   */
  async testConnectivity() {
    console.log("=== CONNECTIVITY TEST START ===");

    const tests = [
      {
        name: "HTTP port 8080 (RECOMMENDED)",
        url: "http://10.0.1.51:8080/eon/eon-config.json",
      },
      {
        name: "HTTPS port 4545",
        url: "https://10.0.1.51:4545/data/eon-config.json",
      },
      { name: "HTTP port 80", url: "http://10.0.1.51/data/eon-config.json" },
      { name: "HTTPS default", url: "https://10.0.1.51/data/eon-config.json" },
    ];

    const results = [];

    for (const test of tests) {
      console.log(`Testing: ${test.name} - ${test.url}`);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(test.url, {
          signal: controller.signal,
          headers: { "Cache-Control": "no-cache" },
        });

        clearTimeout(timeoutId);

        const result = {
          name: test.name,
          url: test.url,
          status: response.status,
          ok: response.ok,
          success: true,
        };

        console.log(`✓ ${test.name}: SUCCESS (${response.status})`);
        results.push(result);
      } catch (error) {
        const result = {
          name: test.name,
          url: test.url,
          error: error.message,
          success: false,
        };

        console.log(`✗ ${test.name}: FAILED - ${error.message}`);
        results.push(result);
      }
    }

    console.log("=== CONNECTIVITY TEST COMPLETE ===");
    console.log("Results:", JSON.stringify(results, null, 2));
    return results;
  }

  /**
   * Nastaví URL serveru
   */
  setServerUrl(url) {
    this.serverUrl = url;
    localStorage.setItem("eon_server_url", url);
  }

  /**
   * Získá URL serveru
   */
  getServerUrl() {
    return this.serverUrl;
  }

  /**
   * Načte konfiguraci ze serveru
   */
  async fetchFromServer() {
    console.log("=== ConfigService: fetchFromServer START ===");
    console.log("Server URL:", this.serverUrl);

    // ⚙️ Pokud běžíme v nativní aplikaci (Android, iOS)
    if (Capacitor.isNativePlatform()) {
      try {
        console.log("Using Advanced HTTP plugin with SSL bypass...");
        console.log("Attempting to connect to:", this.serverUrl);

        // 🔓 VYPNOUT SSL VERIFIKACI pro self-signed certifikáty
        // Toto umožní připojení k HTTPS serveru se self-signed certifikátem
        await HTTP.setServerTrustMode('nocheck');
        console.log("SSL verification disabled (nocheck mode)");

        // Nastavení timeoutů
        await HTTP.setDataSerializer('json');

        const response = await HTTP.get(this.serverUrl, {}, {
          'Cache-Control': 'no-cache'
        });

        console.log("Response status:", response.status);
        if (response.status !== 200)
          throw new Error(`HTTP error ${response.status}`);

        // Advanced HTTP plugin vrací data jako string, musíme parsovat
        const config = typeof response.data === 'string'
          ? JSON.parse(response.data)
          : response.data;

        console.log("Config version:", config.version);

        if (!this.validateConfig(config))
          throw new Error("Invalid config structure");
        return config;
      } catch (error) {
        console.error("Advanced HTTP fetch failed:", error);
        console.error("Error details:", error.message);
        throw error;
      }
    }

    // 🌐 Jinak klasický fetch (web/PWA)
    try {
      const response = await fetch(this.serverUrl, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const config = await response.json();
      if (!this.validateConfig(config))
        throw new Error("Invalid config structure");
      return config;
    } catch (error) {
      console.error("Web fetch failed:", error);
      throw error;
    }
  }

  /**
   * Validace konfigurace
   */
  validateConfig(config) {
    if (!config || typeof config !== "object") return false;
    if (!config.version || !config.weekday || !config.weekend) return false;
    if (!Array.isArray(config.weekday) || !Array.isArray(config.weekend))
      return false;
    const validScheduleLength = (schedule) =>
      schedule.length === 18 || schedule.length === 36 || schedule.length === 48;
    if (!validScheduleLength(config.weekday) || !validScheduleLength(config.weekend))
      return false;

    return true;
  }

  /**
   * Uloží konfiguraci do localStorage
   */
  saveToLocal(config) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      localStorage.setItem(STORAGE_VERSION_KEY, config.version);
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, new Date().toISOString());
      return true;
    } catch (error) {
      console.error("Chyba při ukládání do localStorage:", error);
      return false;
    }
  }

  /**
   * Načte konfiguraci z localStorage
   */
  getFromLocal() {
    try {
      const configStr = localStorage.getItem(STORAGE_KEY);
      if (!configStr) return null;

      const config = JSON.parse(configStr);
      return this.validateConfig(config) ? config : null;
    } catch (error) {
      console.error("Chyba při čtení z localStorage:", error);
      return null;
    }
  }

  /**
   * Získá aktuální verzi z localStorage
   */
  getLocalVersion() {
    return localStorage.getItem(STORAGE_VERSION_KEY);
  }

  /**
   * Získá timestamp poslední aktualizace
   */
  getLastUpdateTimestamp() {
    return localStorage.getItem(STORAGE_TIMESTAMP_KEY);
  }

  /**
   * Zkontroluje, jestli je k dispozici nová verze
   */
  async checkForUpdate() {
    try {
      const serverConfig = await this.fetchFromServer();
      const localVersion = this.getLocalVersion();

      return {
        available: serverConfig.version !== localVersion,
        serverVersion: serverConfig.version,
        localVersion: localVersion,
        serverConfig: serverConfig,
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
      };
    }
  }

  /**
   * Hlavní metoda pro získání konfigurace
   * NOVÁ LOGIKA:
   * 1. Nejdřív zkusí načíst z localStorage (rychlé načtení)
   * 2. Pokud není v localStorage, stáhne ze serveru (první spuštění)
   * 3. Pokud nelze stáhnout ze serveru, použije výchozí data
   *
   * Automatické stahování ze serveru je zakázáno - data se stahují jen:
   * - Při prvním spuštění (když není localStorage)
   * - Když uživatel klikne "Update" v notifikaci
   */
  async getConfig() {
    console.log("=== ConfigService: getConfig START (LOCAL-FIRST mode) ===");

    // KROK 1: Zkusit načíst z localStorage (primární zdroj)
    console.log("STEP 1: Trying to load from localStorage...");
    const localConfig = this.getFromLocal();
    if (localConfig) {
      console.log("localStorage config found, using it");
      console.log("Config version:", localConfig.version);
      console.log("=== ConfigService: getConfig SUCCESS (source: local) ===");
      return {
        success: true,
        source: "local",
        data: localConfig,
        version: localConfig.version,
      };
    }

    // KROK 2: localStorage je prázdný → první spuštění, stáhnout ze serveru
    console.log("STEP 1 FAILED: No localStorage config found");
    console.log("STEP 2: First run detected, trying to fetch from server...");
    try {
      const serverConfig = await this.fetchFromServer();
      console.log("Server fetch successful, saving to localStorage...");
      this.saveToLocal(serverConfig);
      console.log("=== ConfigService: getConfig SUCCESS (source: server, first run) ===");
      return {
        success: true,
        source: "server",
        data: serverConfig,
        version: serverConfig.version,
      };
    } catch (error) {
      console.log("STEP 2 FAILED: Server unavailable");
      console.log("Server error:", error.message);
    }

    // KROK 3: Fallback na výchozí hardcoded data (když není ani localStorage ani server)
    console.log("STEP 3: Using default fallback data");
    console.log("=== ConfigService: getConfig SUCCESS (source: default) ===");
    return {
      success: true,
      source: "default",
      data: {
        version: "default",
        weekday: data,
        weekend: dataWeekend,
        validFrom: "2024-02-01",
        validTo: "2024-04-01",
      },
      version: "default",
    };
  }

  /**
   * Stáhne novou verzi ze serveru a uloží do localStorage
   * Voláno když uživatel klikne "Update" v notifikaci
   */
  async downloadAndApplyUpdate() {
    console.log("=== ConfigService: downloadAndApplyUpdate START ===");
    try {
      const serverConfig = await this.fetchFromServer();
      console.log("New version downloaded:", serverConfig.version);
      this.saveToLocal(serverConfig);
      console.log("New version saved to localStorage");
      console.log("=== ConfigService: downloadAndApplyUpdate SUCCESS ===");
      return {
        success: true,
        data: serverConfig,
        version: serverConfig.version,
      };
    } catch (error) {
      console.error("Failed to download update:", error);
      throw error;
    }
  }

  /**
   * Vymaže lokální konfiguraci
   */
  clearLocal() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_VERSION_KEY);
    localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
  }
}

const configServiceInstance = new ConfigService();
export default configServiceInstance;
