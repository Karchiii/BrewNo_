const keystone = require('keystone');
const middleware = require('../middleware');

function loadContent(req, res) {
  const view = new keystone.View(req, res);
  return view.render('sonstiges');
}

module.exports = (req, res) => {
  middleware.requireAllowedUser(req, res, loadContent);
};
