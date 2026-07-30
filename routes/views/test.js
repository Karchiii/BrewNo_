const keystone = require('keystone');
const middleware = require('../middleware');

const Status = keystone.list('Status');

async function loadContent(req, res) {

    const brewId = req.query.brewId || 1;

    const visibleDatapoints = 30;

    const brews = await Status.model
        .find({ brewId })
        .sort('-createdAt')
        .limit(visibleDatapoints);

    res.locals.visibleDatapoints = visibleDatapoints;
    res.locals.brews = brews;
    res.locals.brewId = brewId;

    const view = new keystone.View(req, res);
    return view.render('test');
}

module.exports = (req, res) => {
    middleware.requireAllowedUser(req, res, loadContent);
};