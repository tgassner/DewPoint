print('Script "Ventilation"" with id = ',Shelly.getCurrentScriptId() + '  Starting ');

var urlTemp = "http://192.168.33.2/rpc/Temperature.GetStatus?id=100";
var urlHumi = "http://192.168.33.2/rpc/Humidity.GetStatus?id=100";

var timeTimeoutMillies = 300000; //5 Minuten
var toggleBackSwitchOffSeconds = 298; //5 Minuten - 2 Sekunden 

var running = false;
var humRemote1 = -200;
var tempRemote1 = -200;
var humCall1Running = false;
var tempCall1Running = false;
var toggle = false;


function log10(x) {
    return Math.log(x) / Math.LN10;    
}

function calcTaupunkt(tempCelsius, relFeuchte) {
    let a;
    let b;

    if (tempCelsius >= 0) {
        a = 7.5;
        b = 237.3;
    } else if (tempCelsius < 0) {
        a = 7.6;
        b = 240.7;
    }

    // Sättigungsdampfdruck in hPa
    let sdd = 6.1078 * Math.pow(10, (a * tempCelsius) / (b + tempCelsius));

    // Dampfdruck in hPa
    let dd = sdd * (relFeuchte / 100);

    let v = log10(dd / 6.1078);
 
    // Taupunkttemperatur (°C)
    let tt = (b * v) / (a - v);
    
    return Math.round((tt + 0.0000001) * 100) / 100;
}

function mainCalc() {
  if (humCall1Running || tempCall1Running) {
          print("At least one is running .. return and wait for it");
          return;
  }
  
  let tempCelsius= Shelly.getComponentStatus('Temperature', 100).tC;  
  let relFeuchte= Shelly.getComponentStatus('Humidity', 100).rh;
  let taupunktLocal = calcTaupunkt(tempCelsius, relFeuchte);
  print("Local Outside Temperatur= " + tempCelsius + "   Local Outside Humidity= " + relFeuchte + "   Local Outside Taupunkt= " + taupunktLocal);
  
  if (tempRemote1 <= -200) {
    print("Fehler konnte remote Temperatur nicht ermitteln");
  }
  
  if (humRemote1 <= -200) {
    print("Fehler konnte remote Humidity nicht ermitteln");
  }
  
  let taupunktRemote1 = calcTaupunkt(tempRemote1 , humRemote1 );
  print("Remote Innen Temperatur= " + tempRemote1 + "   Remote Innen Humidity= " + humRemote1 + "   Remote Innen Taupunkt= " + taupunktRemote1);
  
  if ((taupunktLocal < taupunktRemote1) && (tempCelsius > 3)) {
    print("Switch fan ON for some time");
    Shelly.call("switch.set",{ id: 0, on: true, toggle_after: toggleBackSwitchOffSeconds },function (result, code, msg, ud) {},null);  
  } else {
    print("Switch fan OFF");
    Shelly.call("switch.set",{ id: 0, on: false},function (result, code, msg, ud) {},null);  
  }
}

function callTemp() {
  if (tempCall1Running) {
    return;
  }
  tempCall1Running = true;
  Shelly.call(
    "HTTP.GET", 
    {"url": urlTemp },
    function (response) {
      tempCall1Running = false;
      if (response && response.code && response.code === 200) {
         let json = JSON.parse(response.body);
         let temperature = json["tC"];
         tempRemote1 = temperature;
         //print("remote temperature= " + temperature);
      }
      else {
         tempRemote1 = -200;
         print("Error: HTTP request failed.");
      }
      mainCalc();
    }
  );
}

function CallHumi() {
  if (humCall1Running) {
    return;
  }
  humCall1Running = true;
  Shelly.call(
    "HTTP.GET", 
    {"url": urlHumi },
    function (response) {
      humCall1Running = false;
      if (response && response.code && response.code === 200) {
         let json = JSON.parse(response.body);
         let humidity= json["rh"];
         humRemote1 = humidity;
         //print("remote Humidity= " + humidity);
      }
      else {
         humRemote1 = -200;
         print("Error: HTTP request failed.");
      }
      mainCalc();
    }
  );
}

function start() {
  running = true;
  callTemp();
  CallHumi();
}

Timer.set(
    timeTimeoutMillies ,
    true,
    function (ud) {
        start();
    },
    null
);