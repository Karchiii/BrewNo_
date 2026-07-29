/* public/js/test.js */

document.addEventListener("DOMContentLoaded", () => {

    console.log("test.js wurde geladen");

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

    document.getElementById("tempTopPlus")?.addEventListener("click", () => {
        targetTempTop++;
        updateTemperature(targetTop, targetTempTop);
    });

    document.getElementById("tempTopMinus")?.addEventListener("click", () => {
        targetTempTop--;
        updateTemperature(targetTop, targetTempTop);
    });

    document.getElementById("tempBottomPlus")?.addEventListener("click", () => {
        targetTempBottom++;
        updateTemperature(targetBottom, targetTempBottom);
    });

    document.getElementById("tempBottomMinus")?.addEventListener("click", () => {
        targetTempBottom--;
        updateTemperature(targetBottom, targetTempBottom);
    });


    /* ---------------- Aktoren ---------------- */

    function toggleButton(id) {

    const button = document.getElementById(id);

    if (!button) {
        console.log(id + " nicht gefunden");
        return;
    }

    console.log(id + " Listener gesetzt");

    button.onclick = () => {

        const eingeschaltet = button.classList.contains("btn-success");

        if (eingeschaltet) {

            button.textContent = "AUS";
            button.classList.remove("btn-success");
            button.classList.add("btn-danger");

        } else {

            button.textContent = "EIN";
            button.classList.remove("btn-danger");
            button.classList.add("btn-success");

        }

    };
}

    [
        "heaterTopToggle",
        "coolerTopToggle",
        "pumpToggle",
        "mixerToggle",
        "heaterBottomToggle",
        "coolerBottomToggle",
    ].forEach(toggleButton);

    /* ---------------- Platzhalter Sensoren ---------------- */

    function setTemperature(id, value) {

        const el = document.getElementById(id);

        if (el) {
            el.textContent = value.toFixed(1) + "°C";
        }

    }

    // Testwerte
    setTemperature("dataTempRoom", 18.6);
    setTemperature("dataTempTop2", 22.4);
    setTemperature("dataTempBoiler", 63.2);

});
