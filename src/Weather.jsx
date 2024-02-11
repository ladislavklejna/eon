import { useState, useEffect } from "react";
import React from "react";
import { Row, Col } from "reactstrap";
import "./Weather.css";
import { WiHumidity, WiStrongWind, WiThermometer } from "react-icons/wi";

const Weather = (props) => {
  let poleTeplot = [];
  let cas = props.hod;
  const [poleState, setPoleState] = useState([]);
  let iconSize = 30;
  function WeatherCard(temp, humidity, wind, hour) {
    this.temp = temp;
    this.hum = humidity;
    this.wind = wind;
    this.hour = hour;
  }
  const loadData = () => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=49.50174&longitude=14.61611&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m&timezone=Europe%2FLondon&forecast_days=3"
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        const all = data["hourly"];
        const tempHourly = all["temperature_2m"];
        const humidityHourly = all["relative_humidity_2m"];
        const windHourly = all["wind_speed_10m"];

        for (let i = cas; i < cas + 6; i++) {
          let now = new WeatherCard(
            tempHourly[i],
            humidityHourly[i],
            windHourly[i],
            i
          );
          poleTeplot.push(now);
        }
        setPoleState(poleTeplot);
      });
  };
  useEffect(() => {
    console.log("pocasi");
    loadData();
  }, [props.min]);

  return (
    <div>
      <h4 className="white text-center">Počasí</h4>
      <Row className="mg">
        {poleState.map((x, index) => (
          <Col key={index} xs={3} className="mt-2 py-2 text-center one-card">
            <p>
              {index === 0
                ? "nyní"
                : `${x["hour"] > 23 ? x["hour"] - 24 : x["hour"]}:00`}
            </p>
            <hr />
            <WiThermometer className="white" size={iconSize} />
            <p>{x["temp"]}&deg;C</p>
            <WiHumidity className="white" size={iconSize} />
            <p>{x["hum"]}%</p>
            <WiStrongWind className="white" size={iconSize} />
            <p>{x["wind"]} km/h</p>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Weather;
