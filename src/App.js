import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Table, Progress } from "reactstrap";
import { useEffect, useState } from "react";
import data from "./data";
import dataWeekend from "./dataWeekend";
import Weather from "./Weather";

function App() {
  const [aktual, setAktual] = useState();
  const [zero, setZero] = useState(null);
  const [red, setRed] = useState(null);
  const [message, setMessage] = useState("");
  const [zajakdlouho, setZajakdlouho] = useState(null);
  const [dataPlan, setDataPlan] = useState([]);
  const [min, setMin] = useState();
  const [hod, setHod] = useState();

  let cas = Date.now();
  let date = new Date(cas);
  let den = date.getDay();
  let hodina = date.getHours();
  let minuta = date.getMinutes();

  const refresh = () => {
    cas = Date.now();
    date = new Date(cas);
    den = date.getDay();
    hodina = date.getHours();
    minuta = date.getMinutes();
    let progress = hodina * 60 + minuta - 360;
    setAktual(progress);
    setMin(minuta);
    setHod(hodina);
    let plan;
    // zjisti den a nastavi plan na tyden nebo vikend
    if (den === 6 || den === 0) {
      setDataPlan(dataWeekend);
      plan = dataWeekend;
    } else {
      setDataPlan(data);
      plan = data;
    }
    //kdyz je minuta jednociferna prida pred cislo nulu
    if (minuta >= 0 && minuta < 10) {
      setZero("0");
    } else {
      setZero(null);
    }
    // vypocita casy NT a VT
    let summary = 0;
    let pole = [];
    plan.forEach((eleme) => {
      if (eleme.value === "ano") {
        summary += 60;
      } else {
        pole.push(summary);
        summary += 60;
        pole.push(summary);
      }
    });

    // jak dlouho jeste bude topit?
    let min = 1080;
    for (let i = 0; i < pole.length; i += 2) {
      if (progress <= pole[i]) {
        let vysledek = pole[i] - progress;
        if (vysledek < min) {
          min = vysledek;
        }
      }
    }
    // za jak dlouho zacne?
    let x = 0;
    for (let i = 0; i < pole.length; i += 2) {
      if (progress > pole[i] && progress < pole[i + 1]) {
        let vysledek = pole[i + 1] - progress;
        x = vysledek;
      }
    }
    // cisla pro za jak dlouho zacne topit
    if (x === 0) {
      min = Math.floor(min / 60) + "h : " + (min % 60) + "min";
      setZajakdlouho(min);
    } else {
      x = Math.floor(x / 60) + "h : " + (x % 60) + "min";
      setZajakdlouho(x);
    }

    if (progress > pole[7]) {
      setMessage("Bude topit po zbytek dne");
    } else {
      setMessage("");
    }
    if (
      (progress > pole[0] && progress < pole[1]) ||
      (progress > pole[2] && progress < pole[3]) ||
      (progress > pole[4] && progress < pole[5]) ||
      (progress > pole[6] && progress < pole[7])
    ) {
      setRed(true);
    } else {
      setRed(false);
    }
    console.log("interval");
  };

  useEffect(() => {
    refresh();
    let interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <Container className="cont">
        <div id="one">
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
        </div>
        <div id="two">
          <h2 className="text-center oddo">1.únor - 1.duben 2024</h2>
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
            <Weather min={min} hod={hod} />
          </div>
        </div>
      </Container>
    </div>
  );
}

export default App;
