/**
 * Signs out user and removes all related credentials in cookies
 * @module routes/views/signout
 */
const keystone = require('keystone');

const { session } = keystone;
/**
 * Sign user out from session
 * @type {module.exports}
 */
module.exports = function (req, res) {
  session.signout(req, res, (err) => {
    if (err) return res.send('Error');

    res.redirect('/');
  });
};
