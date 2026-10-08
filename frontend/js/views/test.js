/* public/js/test.js */
import Chart from "chart.js/auto";

document.addEventListener("DOMContentLoaded", () => {

    console.log("test.js wurde geladen");

    // brewId comes from routes/views/test.js via the #brews data-brew-id
    // attribute (same pattern as dashboard.js) - needed on every /mqtt/:cmd
    // call so the backend knows which physical brew a command belongs to.
    const brewsEl = document.getElementById("brews");
    const brewId = brewsEl?.dataset.brewId;
    const maxDatapointsVisible = brewsEl?.dataset.number;

    /* ---------------- Diagramme ---------------- */

    function createTemperatureChart(canvasId, datasetLabels, colors) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        return new Chart(canvas, {
            type: "line",
            data: {
                labels: [],
                datasets: datasetLabels.map((label, i) => ({
                    label,
                    backgroundColor: colors[i],
                    borderColor: colors[i],
                    data: [],
                    borderWidth: 2,
                    borderDash: i === 1 ? [6, 4] : [],
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHitRadius: 10,
                    tension: 0.2,
                    spanGaps: true,
                })),
            },
            options: {
                animation: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: {
                        display: datasetLabels.length > 1,
                        position: "bottom",
                        labels: { boxWidth: 12, padding: 10, usePointStyle: true },
                    },
                    tooltip: { mode: "index", intersect: false },
                },
                scales: {
                    x: {
                        ticks: { autoSkip: true, maxTicksLimit: 6, maxRotation: 0 },
                    },
                    y: {
                        beginAtZero: false,
                        ticks: { maxTicksLimit: 5 },
                    },
                },
            },
        });
    }

    // Topf oben: eine Chart mit zwei Linien (Sensor 1 & Sensor 2).
    const temperatureChartTop = createTemperatureChart(
        "temperatureChartTop",
        ["Sensor 1", "Sensor 2"],
        ["rgb(215, 0, 45)", "rgb(72, 173, 216)"]
    );
    // Topf unten: eine Chart mit einer Linie (Boiler-Sensor).
    const temperatureChartBottom = createTemperatureChart(
        "temperatureChartBottom",
        ["Sensor Unten"],
        ["rgb(46, 148, 85)"]
    );

    function pushDatapoint(chart, timeStamp, values) {
        if (!chart) return;
        chart.data.labels.push(timeStamp);
        values.forEach((value, i) => chart.data.datasets[i].data.push(value));
        while (chart.data.labels.length > maxDatapointsVisible) {
            chart.data.labels.shift();
            chart.data.datasets.forEach((dataset) => dataset.data.shift());
        }
        chart.update();
    }

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

    function setActuatorButtonState(button, enabled) {
        button.textContent = enabled ? "EIN" : "AUS";
        button.classList.toggle("btn-success", enabled);
        button.classList.toggle("btn-danger", !enabled);
    }

    function toggleButton(id, cmd) {
        const button = document.getElementById(id);

        if (!button) {
            console.log(id + " nicht gefunden");
            return;
        }

        button.onclick = async () => {
            if (button.disabled) return;

            const turnOn = !button.classList.contains("btn-success");
            button.disabled = true;

            try {
                const commandSent = await sendCommand(cmd, turnOn ? "on" : "off");
                if (commandSent) setActuatorButtonState(button, turnOn);
            } finally {
                button.disabled = false;
            }
        };
    }

    [
        ["heaterTopToggle", "setHeaterTop"],
        ["pumpToggle", "setPump"],
        ["mixerToggle", "setMixer"],
        ["heaterBottomToggle", "setHeaterBottom"],
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
        pump: "pumpToggle",
        mixer: "mixerToggle",
        heater_bottom: "heaterBottomToggle",
    };

    // Applies a status payload (from MQTT via socket.io, see keystone.js) to
    // the page: sensor readouts plus actuator state as last reported by the
    // device itself, not just what the last local click assumed.
    function processStatus(payload) {
        setTemperature("dataTempRoom", payload.room_temperature);
        setTemperature("dataTempTop2", payload.temperature_top_2);
        setTemperature("dataTempBoiler", payload.temperature);

        pushDatapoint(temperatureChartTop, payload.time_stamp, [payload.room_temperature, payload.temperature_top_2]);
        pushDatapoint(temperatureChartBottom, payload.time_stamp, [payload.temperature]);

        Object.entries(actuatorButtonIds).forEach(([field, buttonId]) => {
            if (payload[field] === undefined) return;
            const button = document.getElementById(buttonId);
            if (!button) return;
            button.textContent = payload[field] ? "EIN" : "AUS";
            button.classList.toggle("btn-success", Boolean(payload[field]));
            button.classList.toggle("btn-danger", !payload[field]);
        });
    }

    // Preload known history (routes/views/test.js already queries this) so
    // the charts and sensor readouts show real data immediately, instead of
    // waiting for new MQTT messages to arrive. The query sorts newest-first,
    // so reverse it to plot the charts left-to-right in chronological order.
    if (brewsEl?.dataset.brews) {
        const brews = JSON.parse(brewsEl.dataset.brews);
        [...brews].reverse().forEach(processStatus);
    }

    // Live updates: the server re-broadcasts every incoming MQTT status
    // message on a socket.io event named after its topic.
    const socket = io.connect(window.location.origin);
    socket.on(`brewery/${brewId}/status`, processStatus);

});
