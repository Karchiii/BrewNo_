
const keystone = require('keystone');

const User = keystone.list('User');

exports.updateUser = function (req, res, next) {
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
      case 'password':
        if (options[i].value.length > 0) {
          dataModel[options[i].name] = options[i].value;
        }

        break;
      case 'passwordConfirm':

        break;
      default:
        dataModel[options[i].name] = options[i].value;
    }
  }

  User.model.findById(req.params.id).exec((err, item) => {
    console.log('CHANGE User', item, dataModel);
    if (err) {
      console.log(err);

      if ((err.name === 'MongoError' && err.code === 11000) || (err.detail.name === 'MongoError' && err.detail.code === 11000)) {
        // Duplicate email
        return next(req, res, true, 'Email address is already in use');
      }

      if (err.error === 'validation errors' && Object.keys(err.detail)[0] === 'password') {
        return next(req, res, true, err.detail.password.error);
      }
      if (err.error === 'validation errors' && Object.keys(err.detail)[0] === 'email') {
        return next(req, res, true, err.detail.email.error);
      }

      return next(req, res, true, 'Update user failed');
    }
    if (!item) return next(req, res, true, 'User to update not found!');
    User.updateItem(
      item,
      dataModel,
      (err0) => {
        if (err0) {
          console.log(err0);
          return next(req, res, true, 'Update user failed');
        }
        return next(req, res, null, 'Success');
      },
    );
  });
};

exports.resetPassword = function (req, res, next) {
  User.model.findOne().where({ $and: [{ resetToken: req.params.token }, { resetExpire: { $gt: Date.now() } }] }).exec((err, user) => {
    if (err) {
      console.log(err);

      req.flash('error', 'Token is not valid or has expired');

      return next(req, res);
    }

    if (user) {
      const newUser = user;

      newUser.resetToken = undefined;
      newUser.resetExpire = undefined;

      newUser.password = req.body.password;

      User.updateItem(user, newUser, (err) => {
        if (err) {
          console.log(err);

          if (err.error === 'validation errors' && Object.keys(err.detail)[0] === 'password') {
            req.flash('error', err.detail.password.error);

            return next(req, res);
          }

          req.flash('error', 'Update user failed');

          return next(req, res);
        }

        req.flash('success', 'Password has been changed');

        return next(req, res);
      });
    } else {
      req.flash('error', 'Token is not valid or has expired');

      return next(req, res);
    }
  });
};

exports.setUserToken = function (req, token) {
  return new Promise((resolve) => {
    User.model.findOne().where('email', req.body.email).exec((err, user) => {
      if (err) resolve(err);

      if (user) {
        const newUser = user;

        newUser.resetToken = token;
        newUser.resetExpire = Date.now() + 3600000; // 1 hour;

        User.updateItem(user, newUser, (err) => {
          if (err) {
            console.log('Update user failed');

            resolve(err);
          }

          resolve(null);
        });
      } else {
        resolve('User not found');
      }
    });
  });
};
