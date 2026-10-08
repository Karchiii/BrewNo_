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
  console.log(`[MQTT] ${req.params.cmd} -> ${options.value}`);
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
       Topic shape: flat names, matching what BrewNo.ino actually subscribes to
       (the firmware has no brewery/<brewId>/... hierarchy; brewId is only
       validated here, not part of the topic, since there's one physical device). */
    case 'setTargetTemperatureTop':
    case 'setTargetTemperatureBottom': {
      const brewId = parseBrewId(options.brewId);
      if (brewId === null) return sendResponse(req, res, true, 'Invalid brewId!');
      const topic = req.params.cmd === 'setTargetTemperatureTop' ? 'top_ts' : 'bottom_ts';
      keystone.get('mqtt').publish(topic, options.value.toString());
      sendResponse(req, res, false, 'MQTT Message sent!');
      break;
    }
    case 'setHeaterTop1':
    case 'setHeaterBottom1':
    case 'setHeaterBottom2': {
      const brewId = parseBrewId(options.brewId);
      if (brewId === null) return sendResponse(req, res, true, 'Invalid brewId!');
      const topic = {
        setHeaterTop1: 'heater_top_1',
        setHeaterBottom1: 'heater_bottom_1',
        setHeaterBottom2: 'heater_bottom_2',
      }[req.params.cmd];
      keystone.get('mqtt').publish(topic, options.value.toString());
      sendResponse(req, res, false, 'MQTT Message sent!');
      break;
    }
    case 'setPump':
    case 'setMixer': {
      const brewId = parseBrewId(options.brewId);
      if (brewId === null) return sendResponse(req, res, true, 'Invalid brewId!');
      const topic = req.params.cmd === 'setPump' ? 'pump' : 'mixer';
      keystone.get('mqtt').publish(topic, options.value.toString());
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
