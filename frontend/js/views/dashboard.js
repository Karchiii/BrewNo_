/**
 * ************************************************************************
 * Controls all Automation Tasks user interaction at /dashboard
 * ************************************************************************
 */
import '../../styles/dashboard.scss';
import Chart from 'chart.js/auto';
require

require('../common');

let fermentRateChart, temperatureChart, maxDatapointsVisible, brewId;

function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

(function ($) {
  const $preloader = $('#preloader');
  const fa = new flashAlert('.alertbox');

  $('[data-tooltip="true"]').tooltip();

  const socket = io.connect(window.location.origin);

  const sendMQTTMessage = function (url, payload) {
    $.post(url.join('/'), payload)
      .then((data) => {
        if (data.error) {
          fa.danger(data.result);
        } else {
          // window.location.reload();
          fa.success(data.result);
        }
      });
  };

  $('#setStartTempBtn').on('click', (e) => {
    if (e.isDefaultPrevented()) {
      // handle the invalid form...
    } else {
      // everything looks good!
      e.preventDefault();
      const url = ['/mqtt/setTargetTemperature'];

      const options = { value: $('#setStartTempTxt').val() };

      $.post(url.join('/'), options)
        .then((data) => {
          if (data.error) {
            fa.danger(data.result);
          } else {
            // window.location.reload();
            fa.success(data.result);
          }
        });
    }
  });

  $('#setMaxTempBtn').on('click', (e) => {
    if (e.isDefaultPrevented()) {
      // handle the invalid form...
    } else {
      // everything looks good!
      const url = ['/mqtt/setMaxTemperature'];
      const options = { value: $('#setMaxTempTxt').val() + '°'};
      sendMQTTMessage(url, options);
    }
  });

  $('#setMaxFermentBtn').on('click', (e) => {
    if (e.isDefaultPrevented()) {
      // handle the invalid form...
    } else {
      // everything looks good!
      const url = ['/mqtt/setMaxFermentrate'];
      const options = { value: $('#setMaxFermentTxt').val() };

      if (!isNaN(options.value) )  {
      sendMQTTMessage(url, options);
      $('#goalFermentTemp').html(options.value + '°')
      }
      else {
        alert('Die Temperatur '+ options.value + ' ist nicht zulässig, da es sich nicht um eine Zahl handelt');
      }
    }
  });

  temperatureChart = new Chart(document.getElementById('temperatureChart'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Temperature Room',
        backgroundColor: 'rgb(215, 0, 45)',
        borderColor: 'rgb(215, 0, 45)',
        data: [],
      },
      {
        label: 'Temperature Fermenter',
        backgroundColor: 'rgb(72, 173, 216)',
        borderColor: 'rgb(72, 173, 216)',
        data: [],
      }],
    },
    options: { },
  });

  fermentRateChart = new Chart(document.getElementById('fermentRateChart'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Fermentrate',
        backgroundColor: 'rgb(215, 0, 45)',
        borderColor: 'rgb(215, 0, 45)',
        data: [],
      }],
    },
    options: { },
  });

  maxDatapointsVisible = $('#brews').attr('data-number');
  brewId = $('#brews').attr('data-brew-id');
  console.log("Showing", maxDatapointsVisible, "datapoints!");
  console.log('Brew ID:', brewId);

  // Preload Charts
  const brewData = JSON.parse($('#brews').attr('data-brews'));
  console.log(brewData);
  for (let i = 0; i < brewData.length; i++) {
    const statusJson = brewData[i];
    processStatus(statusJson);
  }

  socket.on(`brewery/${brewId}/status`, (payload) => {
    processStatus(payload);
  });   
 
}(jQuery));

function processStatus(packet) {
  const payload = packet;

  // Show new data
  $('#dataTempRoom').html(`${Math.round(payload.room_temperature * 100) / 100}&deg;`);
  $('#dataTempBoiler').html(`${Math.round(payload.temperature * 100) / 100}&deg;`);

  $('#tempRoom').css({ background: ` -webkit-linear-gradient(top, #fff 0%, #fff ${100 - payload.room_temperature}%, #db0202 0%, #db0202 100%)` });
  $('#tempBoiler').css({ background: ` -webkit-linear-gradient(top, #fff 0%, #fff ${100 - payload.temperature}%, #db0202 0%, #db0202 100%)` });

  $('#dataFermentRate').html(`${Math.round(payload.ferment_rate * 100) / 100} bpm`);

  $('#dataLastUpdate').html((new Date()).toString());
  $('#dataTotalBubbles').html(payload.bubble_count ?? "unknown");
  $('#dataState').html(payload.state ?? "unknown");

  const mappedRate = map(payload.ferment_rate, 0, 150, 0, 100);
  $('#fermentRate').css({ background: ` -webkit-linear-gradient(top, #fff 0%, #fff ${100 - mappedRate}%, #2e9455 0%, #2e9455 100%)` });

  // Update Ferment-Chart
  fermentRateChart.data.labels.push(payload.time_stamp);
  fermentRateChart.data.datasets[0].data.push(payload.ferment_rate);
  fermentRateChart.update();

  // Prevent overflow
  while (fermentRateChart.data.datasets[0].data.length > maxDatapointsVisible) {
    fermentRateChart.data.labels.shift();
    fermentRateChart.data.datasets[0].data.shift();
  }
  fermentRateChart.update();

  // Update Temp-Chart
  temperatureChart.data.labels.push(payload.time_stamp);
  temperatureChart.data.datasets[0].data.push(payload.room_temperature);
  temperatureChart.data.datasets[1].data.push(payload.temperature);
  temperatureChart.update();

  // Prevent overflow
  while (temperatureChart.data.datasets[0].data.length > maxDatapointsVisible) {
    temperatureChart.data.labels.shift();
    temperatureChart.data.datasets[0].data.shift();
    temperatureChart.data.datasets[1].data.shift();
  }
  temperatureChart.update();
}