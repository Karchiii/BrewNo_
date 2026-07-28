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
  startDate: {
    label: 'Start Date',
    type: Types.Text,
    initial: true,
    required: true,
    showBuilder: true,
    builderType: 'text',
  },
  startTime: {
    label: 'Start Time',
    type: Types.Text,
    initial: true,
    required: true,
    showBuilder: true,
    builderType: 'text',
  },
  dateStamp: {
    label: 'Date',
    type: Types.Text,
    initial: true,
    required: true,
    showBuilder: true,
    builderType: 'text',
  },
  timeStamp: {
    label: 'Time',
    type: Types.Text,
    initial: true,
    required: true,
    showBuilder: true,
    builderType: 'text',
  },
  tempI: {
    label: 'Inner Temperature',
    type: Types.Number,
    initial: true,
    required: false,
    showBuilder: false,
    builderType: 'number',
  },
  tempR: {
    label: 'Room Temperature',
    type: Types.Number,
    initial: true,
    required: false,
    showBuilder: false,
    builderType: 'date',
  },
  humR: {
    label: 'Room Humidity',
    type: Types.Number,
    initial: true,
    required: false,
    showBuilder: false,
    builderType: 'number',
  },
  fermentRate: {
    label: 'Fermentation Rate',
    type: Types.Number,
    initial: true,
    required: false,
    showBuilder: false,
    builderType: 'number',
  },
};

const Brew = new keystone.List('Brew', { track: true });

Brew.add(schema);

Brew.register();

module.exports = schema;
