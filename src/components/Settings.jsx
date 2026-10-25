import React, { useState, useEffect } from "react";
import { App } from "@capacitor/app";
import ConfigService from "../services/ConfigService";
import "./Settings.css";

const Settings = ({ isOpen, onClose }) => {
  const [serverUrl, setServerUrl] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");

  useEffect(() => {
    if (isOpen) {
      setServerUrl(ConfigService.getServerUrl());
      setCurrentVersion(ConfigService.getLocalVersion() || "výchozí");
      const timestamp = ConfigService.getLastUpdateTimestamp();
      if (timestamp) {
        const date = new Date(timestamp);
        setLastUpdate(date.toLocaleString("cs-CZ"));
      } else {
        setLastUpdate("Nikdy");
      }
    }
  }, [isOpen]);

  // Posluchač na hardware back button (Android)
  useEffect(() => {
    let backButtonListener;

    const setupBackButtonListener = async () => {
      if (isOpen) {
        // Přidat posluchač na back button
        backButtonListener = await App.addListener('backButton', () => {
          console.log('Back button pressed in Settings modal');
          onClose();
        });
      }
    };

    setupBackButtonListener();

    // Cleanup - odstranit posluchač
    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    ConfigService.setServerUrl(serverUrl);
    alert("URL serveru byla uložena");
  };

  const handleCheckUpdate = async () => {
    const updateInfo = await ConfigService.checkForUpdate();
    if (updateInfo.error) {
      alert(`Chyba při kontrole aktualizace: ${updateInfo.error}`);
    } else if (updateInfo.available) {
      alert(
        `Nová verze je k dispozici!\nAktuální: ${updateInfo.localVersion}\nNová: ${updateInfo.serverVersion}`
      );
    } else {
      alert("Používáte nejnovější verzi konfigurace");
    }
  };

  const handleClearCache = () => {
    if (window.confirm("Opravdu chcete vymazat lokální data?")) {
      ConfigService.clearLocal();
      alert("Lokální data byla vymazána");
      setCurrentVersion("výchozí");
      setLastUpdate("Nikdy");
    }
  };

  const handleTestConnectivity = async () => {
    alert(
      "Spouštím test připojení... (zkontrolujte Console/Logcat pro detailní výsledky)"
    );
    console.log("🔍 User initiated connectivity test");

    try {
      const results = await ConfigService.testConnectivity();

      // Vytvoř přehledné shrnutí
      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      let message = `Test připojení dokončen!\n\n`;

      if (successful.length > 0) {
        message += `✓ Úspěšné (${successful.length}):\n`;
        successful.forEach((r) => {
          message += `  - ${r.name}: ${r.status}\n`;
        });
      }

      if (failed.length > 0) {
        message += `\n✗ Neúspěšné (${failed.length}):\n`;
        failed.forEach((r) => {
          message += `  - ${r.name}: ${r.error}\n`;
        });
      }

      message += `\nPodrobné výsledky jsou v Console/Logcat.`;

      alert(message);
    } catch (error) {
      console.error("Test connectivity failed:", error);
      alert(`Chyba při testování: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Nastavení</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>URL serveru (NAS)</h3>
            <p className="settings-hint">
              Zadejte URL vašeho NAS serveru s JSON konfigurací
            </p>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://192.168.1.100/eon/eon-config.json"
              className="settings-input"
            />
            <button className="btn-save" onClick={handleSave}>
              Uložit URL
            </button>
          </div>

          <div className="settings-section">
            <h3>Informace</h3>
            <div className="info-row">
              <span className="info-label">Aktuální verze:</span>
              <span className="info-value">{currentVersion}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Poslední aktualizace:</span>
              <span className="info-value">{lastUpdate}</span>
            </div>
          </div>

          <div className="settings-section">
            <h3>Akce</h3>
            <button className="btn-action" onClick={handleCheckUpdate}>
              🔄 Zkontrolovat aktualizaci
            </button>
            {/* <button className="btn-action" onClick={handleTestConnectivity}>
              🔍 Test připojení k serveru
            </button> */}
            <button
              className="btn-action btn-danger"
              onClick={handleClearCache}
            >
              🗑️ Vymazat lokální data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
