
const keystone = require('keystone');

const User = keystone.list('User');

const regExp = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})');

module.exports = function (req, res, next) {
  const { options } = req.body;

  const dataModel = {};

  dataModel.name = {};

  for (let i = 0; i < options.length; i++) {
    switch (options[i].name) {
      case 'role':
        if (options[i].value === 'Admin') {
          dataModel.isAdmin = true;
          dataModel.isEditor = true;
          dataModel.isEnabled = true;
        } else if (options[i].value === 'Editor') {
          dataModel.isAdmin = false;
          dataModel.isEditor = true;
          dataModel.isEnabled = true;
        } else if (options[i].value === 'User') {
          dataModel.isAdmin = false;
          dataModel.isEditor = false;
          dataModel.isEnabled = true;
        }

        break;
      case 'firstName':
        dataModel.name.first = options[i].value;

        break;
      case 'lastName':
        dataModel.name.last = options[i].value;

        break;
      case 'passwordConfirm':

        break;
      default:
        dataModel[options[i].name] = options[i].value;
    }
  }

  const newUser = new User.model(dataModel);

  if (!regExp.test(dataModel.password)) {
    return next(req, res, true, 'Password must contain 8 characters, upper and lower case letters and one digit');
  }

  newUser.save((err, result) => {
    if (err) {
      console.log(err);

      if (err.name === 'MongoError' && err.code === 11000) {
        // Duplicate email
        return next(req, res, true, 'Email address is already in use');
      }

      return next(req, res, true, 'Create user failed');
    }

    return next(req, res, null, 'Success');
  });
  /*
    const newUser = result;

    newUser.password = dataModel.password;

    User.updateItem(result, newUser, (errUpdate) => {
      if (errUpdate) {
        console.log(errUpdate);

        let errValidate = 'Update user failed';

        if (errUpdate.error === 'validation errors' && Object.keys(errUpdate.detail)[0] === 'password') {
          errValidate = errUpdate.detail.password.error;
        }

        if (errUpdate.error === 'validation errors' && Object.keys(errUpdate.detail)[0] === 'email') {
          errValidate = errUpdate.detail.email.error;
        }

        User.model.findOne().where('_id', result._id).remove((errRemove) => next(req, res, true, errValidate));
      } else {
        return next(req, res, null, 'Success');
      }
    });
  });
     */
};
