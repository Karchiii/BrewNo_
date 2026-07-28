/**
 * Returns all available User in paginated Object form
 * @module routes/views/user
 */


const keystone = require('keystone');
const _ = require('lodash');

const middleware = require('../middleware');
const search = require('../utility/search');

const User = keystone.list('User');

let locals;

function loadUsers(req, res) {
  locals = res.locals;
  locals.section = 'user';
  locals.users = [];
  locals.userSchema = require('../../models/User');
  locals.modalDialog = {

  };

  if (req.query.search) {
    locals.search = req.query.search;

    const view = new keystone.View(req, res);

    search.internal(req, res, { lists: ['User'], searchValue: req.query.search }, (results) => {
      if (results.length === 0) {
        req.flash('warning', 'User not found!');

        locals.pagination = [];

        return view.render('user');
      }

      const output = results;

      let numLoaded = 0;

      locals.pagination = [];

      User.model.find().exec((err, users) => {
        locals.userCount = users.length;

        _.each(output, (user, index) => {
          numLoaded++;

          locals.users[index] = user;

          if (numLoaded === output.length) {
            view.render('user');
          }
        });
      });
    });
  } else {
    loadPaginated(req, res);
  }
}

function loadPaginated(req, res) {
  const User = keystone.list('User');
  const view = new keystone.View(req, res);

  let sort = '-createdAt';

  if (req.query.sort) {
    sort = req.query.sort;
  }

  locals.sort = sort;

  User.paginate({
    page: req.query.page || 1,
    perPage: 12,
    maxPages: 25,
    filters: { isTrashed: false },
  })
    .sort(sort)
    .exec((err, users) => {
      if (err) {
        req.flash('error', 'User could not be loaded!');

        return view.render('user');
      }

      if (users.results.length === 0) {
        req.flash('warning', 'No user found!');

        locals.pagination = [];

        return view.render('user');
      }

      let numLoaded = 0;

      const output = users.results;

      locals.pagination = [];

      _.each(output, (user, index) => {
        numLoaded++;

        locals.users[index] = user;

        if (numLoaded === output.length) {
          locals.pagination = users;

          return view.render('user');
        }
      });
    });
}
/**
 * prepare content for a signed in user or forward to login screen
 * @type {module.exports}
 */
module.exports = function (req, res) {
  middleware.requireAllowedAdmin(req, res, loadUsers);
};
