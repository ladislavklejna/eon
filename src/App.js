import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Table, Progress } from "reactstrap";
import { useEffect, useState, useCallback } from "react";
import data from "./data";
import dataWeekend from "./dataWeekend";
import Weather from "./Weather";
import ConfigService from "./services/ConfigService";
import UpdateNotification from "./components/UpdateNotification";
import Settings from "./components/Settings";
import ExpiredDataWarning from "./components/ExpiredDataWarning";
import { isCzechHoliday, isWeekendOrHoliday } from "./utils/czechHolidays";

function App() {
  const [aktual, setAktual] = useState();
  const [zero, setZero] = useState(null);
  const [red, setRed] = useState(null);
  const [message, setMessage] = useState("");
  const [zajakdlouho, setZajakdlouho] = useState(null);
  const [dataPlan, setDataPlan] = useState([]);
  const [min, setMin] = useState();
  const [hod, setHod] = useState();

  // Nové state pro konfiguraci a aktualizace
  const [config, setConfig] = useState(null);
  const [configSource, setConfigSource] = useState("default");
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [validPeriod, setValidPeriod] = useState({ from: "", to: "" });
  const [dataExpired, setDataExpired] = useState(false);
  const [dataExpiredDismissed, setDataExpiredDismissed] = useState(false); // Uživatel zavřel varování
  const [holidayInfo, setHolidayInfo] = useState({
    isHoliday: false,
    name: null,
  });

  // 🧪 DEBUG MODE - Simulace svátků (zakomentujte pro normální provoz)
  const DEBUG_TEST_HOLIDAY = false; // Změňte na false pro normální provoz
  const DEBUG_DATE = new Date(2025, 3, 21, 14, 30); // 21. dubna 2025, 14:30 (Velikonoční pondělí)
  // Další testovací data:
  // new Date(2025, 3, 18, 10, 0) // 18. dubna 2025 - Velký pátek
  // new Date(2024, 11, 25, 12, 0) // 25. prosince 2024 - Vánoce
  // new Date(2025, 0, 1, 9, 0) // 1. ledna 2025 - Nový rok
  // new Date(2024, 4, 1, 15, 0) // 1. května 2024 - Svátek práce

  let cas = DEBUG_TEST_HOLIDAY ? DEBUG_DATE.getTime() : Date.now();
  let date = DEBUG_TEST_HOLIDAY ? DEBUG_DATE : new Date(cas);
  let den = date.getDay();
  let hodina = date.getHours();
  let minuta = date.getMinutes();

  // Funkce pro převod data do českého formátu
  const formatCzechDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");

    const czechMonths = [
      "ledna",
      "února",
      "března",
      "dubna",
      "května",
      "června",
      "července",
      "srpna",
      "září",
      "října",
      "listopadu",
      "prosince",
    ];

    const monthName = czechMonths[parseInt(month) - 1];
    return `${parseInt(day)}. ${monthName} ${year}`;
  };

  const refresh = useCallback(() => {
    if (!config) return; // Počkat na načtení konfigurace

    cas = DEBUG_TEST_HOLIDAY ? DEBUG_DATE.getTime() : Date.now();
    date = DEBUG_TEST_HOLIDAY ? DEBUG_DATE : new Date(cas);
    den = date.getDay();
    hodina = date.getHours();
    minuta = date.getMinutes();
    let progress = hodina * 60 + minuta - 360;
    setAktual(progress);
    setMin(minuta);
    setHod(hodina);

    // Zkontrolovat jestli je dnes svátek
    const holidayCheck = isCzechHoliday(date);
    setHolidayInfo(holidayCheck);

    let plan;
    // Zjisti den a nastavi plan na tyden nebo vikend
    // Svátky se chovají jako víkend (používají víkendový plán)
    if (isWeekendOrHoliday(date)) {
      plan = config.weekend || dataWeekend;
      setDataPlan(plan);
    } else {
      plan = config.weekday || data;
      setDataPlan(plan);
    }
    //kdyz je minuta jednociferna prida pred cislo nulu
    if (minuta >= 0 && minuta < 10) {
      setZero("0");
    } else {
      setZero(null);
    }
    // 18 položek znamená celé hodiny od 6:00, 36 půlhodiny od 6:00
    // a 48 půlhodiny přes celý den. Časy určuje pořadí položek.
    const slotMinutes = plan.length === 18 ? 60 : 30;
    const scheduleStart = plan.length === 48 ? 0 : 360;
    const schedule = plan.map((item, index) => ({
      start: scheduleStart + index * slotMinutes,
      end: scheduleStart + (index + 1) * slotMinutes,
      heating: item.value === "ano",
    }));
    const absoluteMinutes = hodina * 60 + minuta;
    const currentSlot = schedule.find(
      (slot) => absoluteMinutes >= slot.start && absoluteMinutes < slot.end
    );
    const heating = currentSlot ? currentSlot.heating : false;
    setRed(!heating);

    // Délka aktuálního souvislého úseku, včetně přechodů na půlhodině.
    let transition = currentSlot ? currentSlot.end : 0;
    if (currentSlot) {
      for (
        let i = schedule.indexOf(currentSlot) + 1;
        i < schedule.length;
        i += 1
      ) {
        if (schedule[i].heating !== heating) break;
        transition = schedule[i].end;
      }
    } else if (absoluteMinutes < scheduleStart) {
      transition = scheduleStart;
    }
    const remaining = Math.max(0, transition - absoluteMinutes);
    setZajakdlouho(`${Math.floor(remaining / 60)}h : ${remaining % 60}min`);
    setMessage(
      heating && transition >= (plan.length === 48 ? 1440 : 1080)
        ? "Bude topit po zbytek dne"
        : ""
    );
    console.log("interval");
  }, [config]);

  // Načtení konfigurace při startu + kontrola aktualizace
  useEffect(() => {
    const loadConfig = async () => {
      console.log("=== App.js: loadConfig START ===");
      console.log(
        "App running on platform:",
        navigator.userAgent.includes("Android") ? "ANDROID" : "WEB"
      );

      try {
        // KROK 1: Načíst lokální konfiguraci (rychlé načtení)
        const result = await ConfigService.getConfig();
        console.log("Config loaded successfully:");
        console.log("- Source:", result.source);
        console.log("- Version:", result.version);
        console.log("- Success:", result.success);

        setConfig(result.data);
        setConfigSource(result.source);

        if (result.data.validFrom && result.data.validTo) {
          setValidPeriod({
            from: result.data.validFrom,
            to: result.data.validTo,
          });
          console.log(
            "Valid period set:",
            result.data.validFrom,
            "to",
            result.data.validTo
          );

          // KONTROLA PLATNOSTI DAT
          const today = new Date();
          const validToDate = new Date(result.data.validTo);

          // Nastavit dnes na začátek dne (00:00:00)
          today.setHours(0, 0, 0, 0);

          // Nastavit validTo na KONEC dne (23:59:59.999)
          // Data jsou platná celý den včetně validTo
          validToDate.setHours(23, 59, 59, 999);

          if (today > validToDate) {
            console.log("⚠️ WARNING: Configuration data has expired!");
            console.log(
              `Valid until: ${result.data.validTo} (end of day), Today: ${
                new Date().toISOString().split("T")[0]
              }`
            );
            setDataExpired(true);

            // Zkontrolovat jestli uživatel už zavřel varování pro tuto verzi
            const dismissedVersion = localStorage.getItem(
              "eon_expired_dismissed_version"
            );
            if (dismissedVersion === result.data.validTo) {
              console.log(
                "User already dismissed expired warning for this version"
              );
              setDataExpiredDismissed(true);
            } else {
              setDataExpiredDismissed(false);
            }
          } else {
            console.log("✅ Configuration data is still valid");
            console.log(
              `Valid until: ${result.data.validTo} 23:59:59, Today: ${
                new Date().toISOString().split("T")[0]
              }`
            );
            setDataExpired(false);
            setDataExpiredDismissed(false);
            // Vymazat zapamatovanou verzi, protože data jsou platná
            localStorage.removeItem("eon_expired_dismissed_version");
          }
        }

        console.log(
          `=== App.js: loadConfig SUCCESS (source: ${result.source}) ===`
        );

        // KROK 2: Ihned zkontrolovat dostupnost serveru a aktualizaci
        console.log("=== App.js: Checking for updates on startup ===");
        const updateResult = await ConfigService.checkForUpdate();

        if (updateResult.error) {
          console.log("Server not available on startup:", updateResult.error);
          console.log("Continuing with local data");
        } else if (updateResult.available) {
          console.log(
            `🔔 UPDATE AVAILABLE on startup: ${updateResult.localVersion} → ${updateResult.serverVersion}`
          );
          setUpdateAvailable(true);
          setUpdateInfo(updateResult);
        } else {
          console.log(
            "✅ Local version is up to date:",
            updateResult.localVersion
          );
        }
      } catch (error) {
        console.error("=== App.js: loadConfig ERROR ===");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
    };

    loadConfig();
  }, []);

  // Kontrola aktualizace každých 5 minut
  useEffect(() => {
    const checkUpdate = async () => {
      console.log("=== App.js: Checking for updates ===");
      const result = await ConfigService.checkForUpdate();

      if (result.error) {
        // Server není dostupný - nic se nestane, používáme lokální data
        console.log("Update check failed (server unavailable):", result.error);
        return;
      }

      if (result.available && !updateAvailable) {
        console.log(
          `Update available: ${result.localVersion} → ${result.serverVersion}`
        );
        setUpdateAvailable(true);
        setUpdateInfo(result);
      } else if (!result.available) {
        console.log("No update available, current version is up to date");
      }
    };

    // První kontrola po 30 sekundách
    const initialTimeout = setTimeout(checkUpdate, 30000);

    // Pak každých 5 minut
    const interval = setInterval(checkUpdate, 5 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [updateAvailable]);

  useEffect(() => {
    refresh();
    let interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Handler pro aplikaci aktualizace
  const handleApplyUpdate = async () => {
    if (updateInfo && updateInfo.serverConfig) {
      setConfig(updateInfo.serverConfig);
      ConfigService.saveToLocal(updateInfo.serverConfig);
      setConfigSource("server");
      setUpdateAvailable(false);
      setUpdateInfo(null);
      if (
        updateInfo.serverConfig.validFrom &&
        updateInfo.serverConfig.validTo
      ) {
        setValidPeriod({
          from: updateInfo.serverConfig.validFrom,
          to: updateInfo.serverConfig.validTo,
        });
      }
    }
  };

  // Handler pro odmítnutí aktualizace
  const handleDismissUpdate = () => {
    setUpdateAvailable(false);
  };

  // Handler pro zavření varování o expirovaných datech
  const handleDismissExpiredWarning = () => {
    console.log("User dismissed expired data warning");
    // Uložit do localStorage že uživatel zavřel varování pro tuto verzi
    if (validPeriod.to) {
      localStorage.setItem("eon_expired_dismissed_version", validPeriod.to);
      console.log(`Saved dismissed version: ${validPeriod.to}`);
    }
    // Nastavit state aby zmizela červená indikace
    setDataExpiredDismissed(true);
  };

  return (
    <div className="App">
      {/* Tlačítko nastavení */}
      <button className="settings-button" onClick={() => setSettingsOpen(true)}>
        ⚙️
      </button>

      {/* Source indikátor */}
      {/* <div className="config-source-badge">
        {configSource === "server" && "🟢 Server"}
        {configSource === "local" && "🟡 Lokální"}
        {configSource === "default" && "⚪ Výchozí"}
      </div> */}

      {/* Update notifikace */}
      <UpdateNotification
        isVisible={updateAvailable}
        onUpdate={handleApplyUpdate}
        onDismiss={handleDismissUpdate}
        serverVersion={updateInfo?.serverVersion}
        localVersion={updateInfo?.localVersion}
      />

      {/* Varování o expirovaných datech */}
      <ExpiredDataWarning
        isVisible={dataExpired && !dataExpiredDismissed}
        onDismiss={handleDismissExpiredWarning}
        validTo={formatCzechDate(validPeriod.to)}
      />

      {/* Settings panel */}
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <Container className="cont">
        {/* <div id="one">
          <div className="rotate">
            <Progress
              style={{ zIndex: -2 }}
              striped
              animated
              color="info"
              value={aktual}
              max={1080}
            ></Progress>
            <Progress
              multi
              style={{
                zIndex: 2,
                height: "60px",
              }}
            >
              {dataPlan.map((x) => (
                <Progress
                  key={x.id}
                  bar
                  className={`bor ${x.value === "ano" ? "success" : "danger"}`}
                  value="60"
                  max={1080}
                ></Progress>
              ))}
            </Progress>
            <Table className="tab">
              <tr>
                {data.map((x) => (
                  <td key={x.id}>{x.id}</td>
                ))}
              </tr>
            </Table>
          </div>
        </div> */}
        <div id="two">
          {/* Zobrazení svátku */}
          {holidayInfo.isHoliday && (
            <div className="holiday-badge">🎉 {holidayInfo.name}</div>
          )}

          <h2
            className={`text-center oddo ${
              dataExpired && !dataExpiredDismissed ? "expired" : ""
            }`}
          >
            {dataExpired && !dataExpiredDismissed && "⚠️ "}
            {validPeriod.from && validPeriod.to
              ? `Platí do ${formatCzechDate(validPeriod.to)}`
              : "?? - ??"}
            {dataExpired && !dataExpiredDismissed && " ⚠️"}
          </h2>
          <div className="topi">
            <h2 className={`text-center ${red ? "red" : "green"} `}>
              {hod}:{zero + min}
            </h2>
            {message === "" ? (
              <div>
                <h2
                  className={`text-center txt-bold ${red ? "red" : "green"} `}
                >
                  {!red ? "Topí" : "Netopí"}
                </h2>
                <h4
                  className={`text-center txt-bold ${red ? "red" : "green"} `}
                >
                  {red ? "Začne topit za " : "Bude topit ještě "}
                </h4>
                <h4
                  className={`text-center txt-bold hodmin ${
                    red ? "red" : "green"
                  }`}
                >
                  {zajakdlouho}
                </h4>
              </div>
            ) : (
              <h5 className={`text-center ${red ? "red" : "green"} `}>
                {!red ? "Bude topit po zbytek dne" : "Netopí"}
              </h5>
            )}

            {/* Nový horizontální timeline progress bar */}
            <div className="timeline-container">
              <div className="timeline-scroll">
                <div className="timeline-track">
                  {dataPlan
                    .map((item, index) => ({
                      ...item,
                      startMinute:
                        (dataPlan.length === 48 ? 0 : 360) +
                        index * (dataPlan.length === 18 ? 60 : 30),
                    }))
                    .filter(
                      (item) =>
                        item.startMinute +
                          (dataPlan.length === 18 ? 60 : 30) >
                        hod * 60 + min
                    )
                    .map((item, displayIndex) => {
                      const isActive = item.value === "ano";
                      const slotMinutes = dataPlan.length === 18 ? 60 : 30;
                      const isCurrent = item.startMinute <= hod * 60 + min;

                      return (
                        <div
                          key={`${item.id}-${displayIndex}`}
                          className="timeline-hour"
                          style={
                            slotMinutes === 30 ? { minWidth: "60px" } : undefined
                          }
                        >
                          <div
                            className={`timeline-bar ${
                              isActive ? "heating" : "not-heating"
                            } ${isCurrent ? "current-hour" : ""}`}
                          >
                            {isCurrent && (
                              <div
                                className="current-time-indicator"
                                style={{
                                  left: `${((hod * 60 + min - item.startMinute) / slotMinutes) * 100}%`,
                                }}
                              >
                                <div className="indicator-line"></div>
                                <div className="indicator-dot"></div>
                              </div>
                            )}
                          </div>
                          <div className="timeline-label">
                            {`${Math.floor(item.startMinute / 60)}:${
                              item.startMinute % 60 === 0 ? "00" : "30"
                            }`}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <Weather min={min} hod={hod} />
          </div>
        </div>
      </Container>
    </div>
  );
}

export default App;
