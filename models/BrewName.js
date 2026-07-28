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
  name: {
    label: 'Name',
    type: Types.Text,
    initial: true,
    required: true,
    showBuilder: true,
    builderType: 'text',
  }
};

const BrewName = new keystone.List('BrewName', { track: true });
BrewName.add(schema);
BrewName.register();
module.exports = BrewName;
