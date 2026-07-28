/**
 * trashed items CRUD operations
 * @module routes/trashedSections
 */

const keystone = require('keystone');
const _ = require('lodash');

const middleware = require('../../middleware');

/**
 * Check if Recover requested, recover if needed, then forward ot List trashed items function
 * @param req
 * @param res
 * @param next
 */
function updateTrashedItem(req) {
  const { id, section, cmd } = req.params;
  const Doc = _.capitalize(section);
  const list = keystone.list(Doc);

  switch (cmd) {
    case 'recover':
      /* Remove trashed flag from given item */
      list.model.findOneAndUpdate({ _id: id }, { $set: { isTrashed: false } }, (err, result) => {        
        return keystone.get('io').emit('trash', { list: Doc, value: 'recovered' });
      });

      break;
    case 'delete':
      /* Deletion requested */      
      list.model.findById(id).remove((err) => {
        if (err) return keystone.get('io').emit('error', { error: err });
        return keystone.get('io').emit('trash', { list: Doc, value: 'deleted' });
      });      

      break;
    default:
  }
}

/**
 * First recover(if required) then Load isTrashed=true from given Tabels(motif,contracts,devices)
 * @param req
 * @param res
 */
function updateTrashedItems(req, res) {
  switch (req.params.section) {    
    case 'user':
      updateTrashedItem(req, res);

      break;
    default:
      // All other routes are excluded from Trashed-List
      res.status(404).send(keystone.wrapHTMLError('Required trashed section not found'));
  }
}

/**
 * prepare content for signed in user and for given commands
 * @type {module.exports}
 */
module.exports = function (req, res) {
  middleware.requireAllowedUser(req, res, updateTrashedItems);
};
