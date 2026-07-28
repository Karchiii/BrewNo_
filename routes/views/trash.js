/**
 * Container of trash route
 * @module routes/views/trash
 */


const keystone = require('keystone');
const middleware = require('../middleware');

function loadTrashContent(req, res) {
  const view = new keystone.View(req, res);

  const { locals } = res;

  locals.section = 'trash';

  view.render('trash');
}
/**
 * prepare content for a signed in user
 * @type {module.exports}
 */
module.exports = function (req, res) {
  middleware.requireAllowedAdmin(req, res, loadTrashContent);
};
