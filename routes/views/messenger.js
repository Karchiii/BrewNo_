/**
 * Render Overview content
 * @module routes/views/messenger
 */
const keystone = require('keystone');
const middleware = require('../middleware');
const Status = keystone.list('Status');



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

async function loadContent(req, res) {
  const brewId = req.params.brewId;

  const visibleDatapoints = 30;
  res.locals.visibleDatapoints = visibleDatapoints;
  res.locals.brews = await loadBrew(visibleDatapoints, brewId);
  res.locals.brewId = brewId;
  const view = new keystone.View(req, res);
  return view.render('messenger');
}

module.exports = (req, res) => {
    middleware.requireAllowedAdmin(req, res, loadContent);
};

