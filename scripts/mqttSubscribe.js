const mqtt = require('async-mqtt');
const config = require('dotenv').config();

(async () => {
    const mqttClient = await mqtt.connectAsync(config.parsed.MQTT_URI);
    const topicList = ['#'];
    await mqttClient.subscribe(topicList, { qos: 1 });
    mqttClient.on('message', async (topic, message) => {
        console.log(topic, message.toString());
    });
})();