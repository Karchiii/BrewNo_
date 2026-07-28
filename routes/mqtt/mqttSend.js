const keystone = require('keystone');
const middleware = require('../middleware');

function sendResponse(req, res, err, result) {
  res.send({
    error: Boolean(err),
    result,
  });
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
    default:
      sendResponse(req, res, true, 'No valid request!');
  }
};

module.exports = function (req, res) {
  middleware.requireAllowedUser(req, res, mqttSend);
};
