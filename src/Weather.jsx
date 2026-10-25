import { useState, useEffect, useCallback } from "react";
import React from "react";
import { Row, Col } from "reactstrap";
import "./Weather.css";
import { WiHumidity, WiStrongWind, WiThermometer } from "react-icons/wi";

const Weather = (props) => {
  const cas = props.hod || new Date().getHours();
  const [poleState, setPoleState] = useState([]);
  const [error, setError] = useState(null);
  const iconSize = 30;

  const loadData = useCallback(() => {
    // Reset error
    setError(null);

    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=49.50174&longitude=14.61611&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m&timezone=Europe%2FLondon&forecast_days=3"
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Validace dat
        if (!data || !data.hourly) {
          throw new Error('Invalid API response format');
        }

        const all = data.hourly;
        const tempHourly = all.temperature_2m;
        const humidityHourly = all.relative_humidity_2m;
        const windHourly = all.wind_speed_10m;

        // Validace že máme všechna pole
        if (!tempHourly || !humidityHourly || !windHourly) {
          throw new Error('Missing weather data fields');
        }

        // Vytvoření pole s počasím
        const poleTeplot = [];
        for (let i = cas; i < cas + 6; i++) {
          // Kontrola že index je v rozsahu
          if (i < tempHourly.length) {
            poleTeplot.push({
              temp: Math.round(tempHourly[i] * 10) / 10, // Zaokrouhlení na 1 des. místo
              hum: Math.round(humidityHourly[i]),
              wind: Math.round(windHourly[i] * 10) / 10,
              hour: i
            });
          }
        }

        setPoleState(poleTeplot);
      })
      .catch((error) => {
        console.error('Chyba při načítání počasí:', error);
        setError(error.message);
        // Nastavit prázdné pole aby nezpůsobilo crash
        setPoleState([]);
      });
  }, [cas]);

  useEffect(() => {
    console.log("pocasi - načítám data");
    loadData();

    // Refresh každých 15 minut
    const interval = setInterval(loadData, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div>
      <h4 className="white text-center">Počasí</h4>
      {error ? (
        <div className="text-center white" style={{ padding: '20px', opacity: 0.7 }}>
          <p>Nepodařilo se načíst data o počasí</p>
          <p style={{ fontSize: '12px' }}>{error}</p>
        </div>
      ) : poleState.length === 0 ? (
        <div className="text-center white" style={{ padding: '20px', opacity: 0.7 }}>
          <p>Načítám data o počasí...</p>
        </div>
      ) : (
        <Row className="mg">
          {poleState.map((x, index) => (
            <Col key={index} xs={3} className="mt-2 py-2 text-center one-card">
              <p>
                {index === 0
                  ? "nyní"
                  : `${x.hour > 23 ? x.hour - 24 : x.hour}:00`}
              </p>
              <hr />
              <WiThermometer className="white" size={iconSize} />
              <p>{x.temp}&deg;C</p>
              <WiHumidity className="white" size={iconSize} />
              <p>{x.hum}%</p>
              <WiStrongWind className="white" size={iconSize} />
              <p>{x.wind} km/h</p>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Weather;
