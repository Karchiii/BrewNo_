const middleware = require('../middleware');

function crudUser(req, res) {
  switch (req.params.cmd) {
    case 'create':
      const create = require('./user/create');

      create(req, res, sendResponse);

      break;
    case 'update':
      const update = require('./user/update');

      update.updateUser(req, res, sendResponse);

      break;
    case 'remove':
      const remove = require('./user/delete');

      remove(req, res, sendResponse);

      break;
    default:
      sendResponse(req, res, true, 'No valid request!');
  }
}

/**
 * Sends the prepared information back to client
 * @param req
 * @param res
 * @param err
 * @param result
 */
function sendResponse(req, res, err, result) {
  res.send({
    error: Boolean(err),
    result,
  });
}

module.exports = function (req, res) {
  middleware.requireAllowedUser(req, res, crudUser);
};
