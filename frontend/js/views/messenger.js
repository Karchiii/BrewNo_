/**
 * Render Overview content
 * @module routes/views/messenger
 */

const sendToHW=()=>{
  sendMessage('setTargetTemperature', {value: 24})//Alles ins Objekt rein, Heiz und Kühlanweisung, Zeitstempel (Unix, Lesbar)
}

const sendBtn = document.getElementById('send')
const sendFermentBtn = document.getElementById('setMaxFermentBtn')
sendBtn.addEventListener("click", sendToHW)
sendFermentBtn.addEventListener("click", sendToHW)
//Aus BrewId herauslesen, Header optional, Strings erwartet, JSON sinnvoll
//Error Catching -> Nur 1 ID -> sonst unterbrechbar #
//PK: Gerät + BrewID?
//Offline Mode -> nach Absturz Werte für später speichern
//SD Karten leser!! Recherche
//Webserver für WLAN Einstellung
//WIFININA: Taster für Werkzustand aber nicht Platt machen

const sendMessage = (command, options) => {
  fetch(`/mqtt/${command}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error(error);
    });
};

