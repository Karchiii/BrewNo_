/**
 * Render dashboard content
 * @module routes/views/dashboard
 */
const keystone = require('keystone');
const _ = require('lodash');

const middleware = require('../middleware');

const Brew = keystone.list('Brew');
const Status = keystone.list('Status');

let locals;

async function loadContent(req, res) {
  const brewId = req.params.brewId;

  const visibleDatapoints = 30;
  res.locals.visibleDatapoints = visibleDatapoints;
  res.locals.brews = await loadBrew(visibleDatapoints, brewId);
  res.locals.brewId = brewId;
  const view = new keystone.View(req, res);
  return view.render('dashboard');
}

function loadBrew(visibleDatapoints, brewId) {
  return new Promise(resolve => {
    Status.model.find({ brewId: brewId }).sort('-createdAt').limit(visibleDatapoints).exec((err, brews) => {
      if (err) {
        resolve('Error reading Brews!');
      }
      resolve(brews);
    });
  });
}

/**
 * prepare content for a signed in user or forward to login screen
 * @type {module.exports}
 */
module.exports = (req, res) => {
  middleware.requireAllowedUser(req, res, loadContent);
};
