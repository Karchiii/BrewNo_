require('dotenv').config();

const keystone = require('keystone');
const _ = require('lodash');
const socketio = require('socket.io');
const mqtt = require('async-mqtt');

keystone.init({
  name: 'BrewNo',
  brand: 'HSD',
  // sass: 'public',
  static: 'public',
  views: 'templates/views',
  'view engine': 'pug',
  port: process.env.PORT,
  'auto update': true,
  auth: true,
  compress: true,
  'user model': 'User',
  session: true,
  'cookie secret': process.env.COOKIE_SECRET,
  'session store': 'mongo',
  'session store options': { ttl: 1 * 24 * 60 * 60 },
  headless: true, // disable AdminUI
  'file limit': process.env.FILE_LIMIT,
});

keystone.import('models');

keystone.set('locals', {
  _,
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable,
});

keystone.set('routes', require('./routes'));

/* MQTT Connect/Subscribe */

const Status = keystone.list('Status');
async function startMQTT() {
  const mqttClient = await mqtt.connectAsync(process.env.MQTT_URI);

  keystone.set('mqtt', mqttClient);

  await mqttClient.subscribe(['brewery/+/status'], { qos: 1 });

  mqttClient.on('message', async (topic, message) => {
    console.log(`[MQTT RECEIVED] ${topic} -> ${message.toString()}`);

    const brewId = +(topic.replace('brewery/', "").replace("/status", ""));
    const payload = JSON.parse(message.toString());
    payload.brewId = brewId;

    const status = new Status.model(payload);

    status.save((err, result) => {
      
    });

    // ToDo: Send only to clients viewing the correct brewery. (Currently filtered in frontend)
    keystone.get('io').sockets.emit(topic, payload);
  });
}

/* SOCKET IO */
function startSocket() {
  const io = keystone.get('io');

  io.on('connection', (socket) => {
    console.log('RECEIVE SOCKET', socket.id);

    socket.on('sync', (data) => {
      console.log('SOCKET joins Room:', data.my);
    });
  });
}

keystone.start({
  onHttpsServerCreated() {
    keystone.set('io', socketio(keystone.httpsServer));
    startMQTT();
    startSocket();
  },
  onHttpServerCreated() {
    keystone.set('io', socketio(keystone.httpServer));
    startMQTT();
    startSocket();
  },
});
