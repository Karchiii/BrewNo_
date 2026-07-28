const keystone = require('keystone');

const { Types } = keystone.Field;

const schema = {
  brewId: {
    label: 'Brew ID',
    type: Types.Number,
    required: true,
    initial: true,
    showBuilder: true,
    builderType: 'number',
  },
  time_stamp: {
    label: 'Timestamp',
    type: Types.Text,
    initial: true,
    required: false,
    showBuilder: true,
    builderType: 'text',
  },
  date_stamp: {
    label: 'Datestamp',
    type: Types.Text,
    initial: true,
    required: false,
    showBuilder: true,
    builderType: 'text',
  },
  brew_name: {
      label: 'Brew Name',
      type: Types.Text,
      initial: true,
      required: false,
      showBuilder: true,
      builderType: 'text',
  },
  brew_stage: {
    label: 'Brew Stage',
    type: Types.Text,
    initial: true,
    required: false,
    showBuilder: true,
    builderType: 'text',
  },
  measure_interval: {
    label: 'Measure Interval',
    type: Types.Number,
    initial: true,
    required: false,
    showBuilder: true,
    builderType: 'number',
  },
  state: {
    label: 'State',
    type: Types.Text,
    initial: true,
    required: false,
    showBuilder: true,
    builderType: 'text',
  },
  temperature: {
    label: 'Boiler Temperature',
    type: Types.Number,
    initial: true,
    required: false,
    showBuilder: false,
    builderType: 'number',
  },
  ferment_rate: {
    label: 'Fermentation Rate',
    type: Types.Number,
    initial: true,
    required: false,
    showBuilder: false,
    builderType: 'number',
  },
  bubble_count: {
    label: 'Bubble Count',
    type: Types.Number,
    initial: true,
    required: false,
    showBuilder: false,
    builderType: 'number',
  },
  room_temperature: {
    label: 'Room Temperature',
    type: Types.Number,
    initial: true,
    required: false,
    showBuilder: false,
    builderType: 'date',
  },
  room_humidity: {
    label: 'Room Humidity',
    type: Types.Number,
    initial: true,
    required: false,
    showBuilder: false,
    builderType: 'number',
  },
};

const Status = new keystone.List('Status', { track: true });

Status.add(schema);

Status.register();

module.exports = schema;
