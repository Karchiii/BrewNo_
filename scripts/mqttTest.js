(async () => {
  const config = require('dotenv').config();
  const mqtt = require("async-mqtt");
  console.log("MQTT URI:", config.parsed.MQTT_URI);
  const client = mqtt.connect(config.parsed.MQTT_URI);
  
  const testPacket = require("./../test.json");
  
  console.log("Publishing ...");
  await client.publish("brewery/5/status", JSON.stringify(testPacket));
  console.log("Published");
  client.end();
})();