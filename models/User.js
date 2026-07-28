
const keystone = require('keystone');

const { Types } = keystone.Field;

const schema = {
  name: {
    type: Types.Name,
    required: true,
    index: true,
    showBuilder: true,
    builderType: 'text',
  },
  email: {
    label: 'Email',
    type: Types.Email,
    initial: true,
    required: true,
    unique: true,
    index: true,
    showBuilder: true,
    builderType: 'text',
  },
  password: {
    label: 'Password',
    type: Types.Password,
    initial: true,
    required: true,
    showBuilder: true,
    builderType: 'password',
  },
  resetToken: {
    label: 'Password Token',
    type: Types.Text,
    initial: true,
    required: false,
    showBuilder: false,
    builderType: 'text',
  },
  resetExpire: {
    label: 'Password Reset Expire',
    type: Types.Date,
    initial: true,
    required: false,
    showBuilder: false,
    builderType: 'date',
  },

  isAdmin: {
    type: Types.Boolean,
    initial: true,
    default: false,
    required: false,
  },

  isEditor: {
    type: Types.Boolean,
    initial: true,
    default: false,
    required: false,
  },

  isEnabled: {
    type: Types.Boolean,
    initial: true,
    default: false,
    required: false,
  },

  isTrashed: {
    type: Types.Boolean,
    initial: true,
    default: false,
    required: false,
  },
};

const User = new keystone.List('User', { track: true });

User.add(schema);

// Provide access to User
User.schema.virtual('canAccessUser').get(function () {
  return this.isAdmin;
});
// Provide access to Edit
User.schema.virtual('canAccessEdit').get(function () {
  return this.isEditor;
});
// Provide access to Dashboard
User.schema.virtual('canAccessDashboard').get(function () {
  return this.isEnabled;
});

User.schema.virtual('fullName').get(function () {
  return this.name.full;
});

User.register();

module.exports = schema;
