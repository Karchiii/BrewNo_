/* public/js/test.js */

document.addEventListener("DOMContentLoaded", () => {

    console.log("test.js wurde geladen");

    // brewId comes from routes/views/test.js via the #brews data-brew-id
    // attribute (same pattern as dashboard.js) - needed on every /mqtt/:cmd
    // call so the backend knows which physical brew a command belongs to.
    const brewsEl = document.getElementById("brews");
    const brewId = brewsEl?.dataset.brewId;

    // POSTs a command to routes/mqtt/mqttSend.js, which publishes it via MQTT.
    // Resolves to true/false so callers can decide whether to update the UI.
    function sendCommand(cmd, value) {
        return fetch(`/mqtt/${cmd}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brewId, value }),
        })
            .then((res) => res.json())
            .then((data) => !data.error)
            .catch((err) => {
                console.error(cmd, err);
                return false;
            });
    }

    /* ---------------- Solltemperaturen ---------------- */

    let targetTempTop = 20;
    let targetTempBottom = 20;

    const targetTop = document.getElementById("targetTempTop");
    const targetBottom = document.getElementById("targetTempBottom");

    function updateTemperature(element, value) {
        if (element) {
            element.textContent = value + "°C";
        }
    }

    // Value is still mutated immediately (same as before), but the display is
    // only updated once the backend confirms the MQTT message went out - and
    // rolled back if the request failed, so it can't desync from the device.
    document.getElementById("tempTopPlus")?.addEventListener("click", () => {
        targetTempTop++;
        sendCommand("setTargetTemperatureTop", targetTempTop).then((ok) => {
            if (ok) {
                updateTemperature(targetTop, targetTempTop);
            } else {
                targetTempTop--;
            }
        });
    });

    document.getElementById("tempTopMinus")?.addEventListener("click", () => {
        targetTempTop--;
        sendCommand("setTargetTemperatureTop", targetTempTop).then((ok) => {
            if (ok) {
                updateTemperature(targetTop, targetTempTop);
            } else {
                targetTempTop++;
            }
        });
    });

    document.getElementById("tempBottomPlus")?.addEventListener("click", () => {
        targetTempBottom++;
        sendCommand("setTargetTemperatureBottom", targetTempBottom).then((ok) => {
            if (ok) {
                updateTemperature(targetBottom, targetTempBottom);
            } else {
                targetTempBottom--;
            }
        });
    });

    document.getElementById("tempBottomMinus")?.addEventListener("click", () => {
        targetTempBottom--;
        sendCommand("setTargetTemperatureBottom", targetTempBottom).then((ok) => {
            if (ok) {
                updateTemperature(targetBottom, targetTempBottom);
            } else {
                targetTempBottom++;
            }
        });
    });


    /* ---------------- Aktoren ---------------- */

    function toggleButton(id, cmd) {

    const button = document.getElementById(id);

    if (!button) {
        console.log(id + " nicht gefunden");
        return;
    }

    console.log(id + " Listener gesetzt");

    button.onclick = () => {

        const eingeschaltet = button.classList.contains("btn-success");

        // Only flip the button once the backend confirms the MQTT message
        // went out, so a failed request can't desync the button from the device.
        sendCommand(cmd, eingeschaltet ? "off" : "on").then((ok) => {

            if (!ok) return;

            if (eingeschaltet) {

                button.textContent = "AUS";
                button.classList.remove("btn-success");
                button.classList.add("btn-danger");

            } else {

                button.textContent = "EIN";
                button.classList.remove("btn-danger");
                button.classList.add("btn-success");

            }

        });

    };
}

    [
        ["heaterTopToggle", "setHeaterTop"],
        ["coolerTopToggle", "setCoolerTop"],
        ["pumpToggle", "setPump"],
        ["mixerToggle", "setMixer"],
        ["heaterBottomToggle", "setHeaterBottom"],
        ["coolerBottomToggle", "setCoolerBottom"],
    ].forEach(([id, cmd]) => toggleButton(id, cmd));

    /* ---------------- Sensoren (Live-Daten via MQTT) ---------------- */

    function setTemperature(id, value) {

        const el = document.getElementById(id);

        if (el && value != null) {
            el.textContent = value.toFixed(1) + "°C";
        }

    }

    const actuatorButtonIds = {
        heater_top: "heaterTopToggle",
        cooler_top: "coolerTopToggle",
        pump: "pumpToggle",
        mixer: "mixerToggle",
        heater_bottom: "heaterBottomToggle",
        cooler_bottom: "coolerBottomToggle",
    };

    // Applies a status payload (from MQTT via socket.io, see keystone.js) to
    // the page: sensor readouts plus actuator state as last reported by the
    // device itself, not just what the last local click assumed.
    function processStatus(payload) {
        setTemperature("dataTempRoom", payload.room_temperature);
        setTemperature("dataTempTop2", payload.temperature_top_2);
        setTemperature("dataTempBoiler", payload.temperature);

        Object.entries(actuatorButtonIds).forEach(([field, buttonId]) => {
            if (payload[field] === undefined) return;
            const button = document.getElementById(buttonId);
            if (!button) return;
            button.textContent = payload[field] ? "EIN" : "AUS";
            button.classList.toggle("btn-success", Boolean(payload[field]));
            button.classList.toggle("btn-danger", !payload[field]);
        });
    }

    // Preload the most recent known status (routes/views/test.js already
    // queries this) so the page shows real values immediately, instead of
    // waiting for the next MQTT message to arrive.
    if (brewsEl?.dataset.brews) {
        const brews = JSON.parse(brewsEl.dataset.brews);
        if (brews.length > 0) {
            processStatus(brews[0]);
        }
    }

    // Live updates: the server re-broadcasts every incoming MQTT status
    // message on a socket.io event named after its topic.
    const socket = io.connect(window.location.origin);
    socket.on(`brewery/${brewId}/status`, processStatus);

});
