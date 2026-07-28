/**
 * Render Overview content
 * @module routes/views/overview
 */
const keystone = require('keystone');
const middleware = require('../middleware');
const Status = keystone.list('Status');

async function loadContent(req, res) {
    const view = new keystone.View(req, res);

    res.locals.brews = await new Promise((resolve) => Status.model.find().distinct("brewId").exec(async (err, data) => {
        let out = [];
        for (let brewId of data) {
            
            const brewData = await new Promise(resolve => Status.model.find({ brewId: brewId }).sort('-createdAt').limit(1).exec((err, brews) => {
                resolve(brews);
            }));

            out.push({
                brewName: await req.getFermenterName(brewId),
                brewId: brewId,
                bubbles: brewData[0].bubble_count,
                temp: brewData[0].temperature
            });
        }

        resolve(out);
    }));
    console.log(res.locals.brews);
    return view.render('overview');
}

/**
  * prepare content for a signed in user or forward to login screen
  * @type {module.exports}
  */
module.exports = (req, res) => {
    middleware.requireAllowedUser(req, res, loadContent);
};
