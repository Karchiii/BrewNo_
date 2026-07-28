
const keystone = require('keystone');
const _ = require('lodash');
const middleware = require('../../middleware');
const dataSchema = require('../../../models/User');


function createUser(req, res) {
  const view = new keystone.View(req, res);
  const { locals } = res;
  const builderFields = {};

  const User = keystone.list('User');

  locals.user = [];

  if (req.params.id === 'null') {
    _.each(dataSchema, (index, val) => {
      if (dataSchema[val].showBuilder === true) {
        if (val === 'name') {
          builderFields.firstName = {
            label: 'First Name', name: 'firstName', showBuilder: true, builderType: 'text', value: '',
          };
          builderFields.lastName = {
            label: 'Last Name', name: 'lastName', showBuilder: true, builderType: 'text', value: '',
          };
        }

        builderFields[val] = dataSchema[val];
        builderFields[val].name = val;
        builderFields[val].value = dataSchema[val].default;
      }
    });

    builderFields.role = {
      label: 'Role', name: 'role', showBuilder: true, builderType: 'select', value: '',
    };
    builderFields.passwordConfirm = {
      label: 'Confirm Password', name: 'passwordConfirm', showBuilder: true, builderType: 'password', value: '',
    };
  }

  const roles = [];

  roles.push({ id: 0, name: 'User', altName: 'User' });
  roles.push({ id: 1, name: 'Editor', altName: 'Editor' });
  roles.push({ id: 2, name: 'Admin', altName: 'Admin' });

  locals.fields = builderFields;

  locals.roles = roles;

  if (req.params.id !== 'null') {
    User.model.findById(req.params.id).exec((err, user) => {
      if (err) return res.send(err);

      locals.user = user;

      _.each(dataSchema, (index, val) => {
        if (dataSchema[val].showBuilder === true) {
          builderFields[val] = dataSchema[val];
          builderFields[val].name = val;

          switch (val) {
            case 'name':
              builderFields.firstName = {
                label: 'First Name', name: 'firstName', showBuilder: true, builderType: 'Text', value: user.name.first,
              };
              builderFields.lastName = {
                label: 'Last Name', name: 'lastName', showBuilder: true, builderType: 'Text', value: user.name.last,
              };

              break;
            case 'email':
              builderFields[val].value = user.email;

              break;
            case 'password':
              builderFields[val].value = '';
              builderFields.passwordConfirm = {
                label: 'Confirm Password', name: 'passwordConfirm', showBuilder: true, builderType: 'password', value: '',
              };

              break;
          }
        }
      });

      builderFields.role = {
        label: 'Role', name: 'role', showBuilder: true, builderType: 'select', value: '',
      };

      if (user.isAdmin) {
        builderFields.role.value = 'Admin';
      } else if (!user.isAdmin && user.isEditor) {
        builderFields.role.value = 'Editor';
      } else if (!user.isAdmin && !user.isEditor && user.isEnabled) {
        builderFields.role.value = 'User';
      }

      locals.modalDialog = {
        title: 'Edit User',
      };

      locals.showOverwrite = true;

      view.render('modals/user');
    });
  } else {
    locals.modalDialog = {
      title: 'Create User',
    };

    view.render('modals/user');
  }
}

module.exports = function (req, res) {
  middleware.requireAllowedAdmin(req, res, createUser);
};
