
const keystone = require('keystone');

const User = keystone.list('User');

module.exports = function (req, res, next) {
  User.model.findById(req.params.id).exec((err, item) => {
    if (item) {
      const newUser = new User.model(item);

      newUser.isTrashed = true;

      User.updateItem(item, newUser, (err) => {
        if (err) {
          console.log(err);

          return next(req, res, true, 'Remove user failed!');
        }

        return next(req, res, null, 'Success');
      });
    } else {
      return next(req, res, true, 'User not found!');
    }
  });
};
