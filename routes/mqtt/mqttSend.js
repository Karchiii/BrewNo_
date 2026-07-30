const keystone = require('keystone');
const middleware = require('../middleware');

function sendResponse(req, res, err, result) {
  res.send({
    error: Boolean(err),
    result,
  });
}

// The topic identifies which physical brew a command is for, so it has to come
// from the request rather than be hardcoded. Validated here (not per-case) since
// every new test.js command needs the same check before it can be used in a topic.
function parseBrewId(raw) {
  const brewId = Number(raw);
  return Number.isInteger(brewId) && brewId > 0 ? brewId : null;
}

mqttSend = (req, res) => { //setTs
  const options = req.body;
  switch (req.params.cmd) {
    case 'setTargetTemperature':
      keystone.get('mqtt').publish('brewery/NR/temperature/target/set', options.value.toString());
      sendResponse(req, res, false, 'MQTT Message sent!');
      break;
    case 'setMaxTemperature':
      keystone.get('mqtt').publish('brewery/NR/temperature/max/set', options.value.toString());
      sendResponse(req, res, false, 'MQTT Message sent!');
      break;
    case 'setMaxFermentrate':
      keystone.get('mqtt').publish('brewery/NR/fermentrate/max/set', options.value.toString());
      sendResponse(req, res, false, 'MQTT Message sent!');
      break;
    case 'Beispiel':
      keystone.get('mqtt').publish('dummyTopic', options.value.toString());
      sendResponse(req, res, false, 'MQTT Message sent!');
      break;

    /* ---- test.js commands: per-brew, per-pot (top/bottom) ----
       Topic shape: brewery/<brewId>/<metric>/[<zone>/]<setting>/set */
    case 'setTargetTemperatureTop':
    case 'setTargetTemperatureBottom': {
      const brewId = parseBrewId(options.brewId);
      if (brewId === null) return sendResponse(req, res, true, 'Invalid brewId!');
      const zone = req.params.cmd === 'setTargetTemperatureTop' ? 'top' : 'bottom';
      keystone.get('mqtt').publish(`brewery/${brewId}/temperature/${zone}/target/set`, options.value.toString());
      sendResponse(req, res, false, 'MQTT Message sent!');
      break;
    }
    case 'setHeaterTop':
    case 'setCoolerTop':
    case 'setHeaterBottom':
    case 'setCoolerBottom': {
      const brewId = parseBrewId(options.brewId);
      if (brewId === null) return sendResponse(req, res, true, 'Invalid brewId!');
      const zone = req.params.cmd.endsWith('Top') ? 'top' : 'bottom';
      const actuator = req.params.cmd.startsWith('setHeater') ? 'heater' : 'cooler';
      keystone.get('mqtt').publish(`brewery/${brewId}/${actuator}/${zone}/set`, options.value.toString());
      sendResponse(req, res, false, 'MQTT Message sent!');
      break;
    }
    case 'setPump':
    case 'setMixer': {
      const brewId = parseBrewId(options.brewId);
      if (brewId === null) return sendResponse(req, res, true, 'Invalid brewId!');
      const actuator = req.params.cmd === 'setPump' ? 'pump' : 'mixer';
      keystone.get('mqtt').publish(`brewery/${brewId}/${actuator}/set`, options.value.toString());
      sendResponse(req, res, false, 'MQTT Message sent!');
      break;
    }

    default:
      sendResponse(req, res, true, 'No valid request!');
  }
};

module.exports = function (req, res) {
  middleware.requireAllowedUser(req, res, mqttSend);
};
