/**
 * Handle FORM POST process for sign in.
 * @module routes/views/signin
 */
const keystone = require('keystone');

const { session } = keystone;
const url = require('url');

/**
 * Determine if values in POST object are valid and user is a valid user
 * @type {module.exports}
 */
module.exports = function (req, res) {
  function renderView() {
    const view = new keystone.View(req, res);
    const { locals } = res;

    if (req.user && req.user.canAccessDashboard) {
      locals.section = 'overview';

      res.redirect('/overview');
    } else {
      locals.section = 'home';

      view.render('index');
    }
  }

  // If a form was submitted, process the login attempt
  if (req.method === 'POST') {
    if (!keystone.security.csrf.validate(req)) {
      req.flash('error', 'There was an error with your request, please try again.');

      return renderView();
    }

    if (!req.body.email || !req.body.password) {
      req.flash('error', 'Please enter your email address and password.');

      return renderView();
    }

    const onSuccess = function (user) {
      if (req.query.from && req.query.from.match(/^(?!http|\/\/|javascript).+/)) {
        const parsed = url.parse(req.query.from);

        if (parsed.host || parsed.protocol || parsed.auth) {
          res.redirect('/overview');
        } else {
          res.redirect(parsed.path);//parse.path
        }
      } else {
        res.redirect('/overview');
      }
    };

    const onFail = function (err) {
      const message = (err && err.message) ? err.message : 'Sorry, that email and password combo are not valid.';

      req.flash('error', message);

      renderView();
    };

    session.signin(req.body, req, res, onSuccess, onFail);
  } else {
    renderView();
  }
};
