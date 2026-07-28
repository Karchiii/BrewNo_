/**
 * Prepare list of trashed items for a section
 * @module routes/trashedSections
 */

const keystone = require('keystone');
const _ = require('lodash');
const middleware = require('../middleware');

/**
 * loads Trashed Items for given List
 * @param req
 * @param res
 * @param list section List Object
 */
function listTrashedSection(req, res) {
  const Doc = _.capitalize(req.params.section);

  const list = keystone.list(Doc);

  const view = new keystone.View(req, res);

  list.paginate({
    page: req.query.page || 1,
    perPage: 5,
    maxPages: 5,
    filters: { isTrashed: true },
  })
    .sort({ createdAt: 1 })
    .exec((err, content) => {
      if (err) console.error(err);

      res.locals.section = _.capitalize(req.params.section);
      res.locals.deletedItems = content.results;
      res.locals.pagination = content;

      view.render('trashedSections');
    });
}

/**
 * prepare content for signed in user and for given commands
 * @type {module.exports}
 */
module.exports = function (req, res) {
  middleware.requireAllowedUser(req, res, listTrashedSection);
};
