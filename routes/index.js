/**
 * prepares Routes for ExpressJS.
 * @module routes/index
 */
const keystone = require('keystone');
const middleware = require('./middleware');
const importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', require("./fermenterNameMapper.js"));
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);
keystone.pre('render', keystone.security.csrf.middleware.init);

// Import Route Controllers
const routes = importRoutes('./');

// Setup Route Bindings
module.exports = function (app) {
  // Views
  /**
   * Signin route: Allows to control Signed In user.
   */
  app.get('/', keystone.security.csrf.middleware.init, routes.views.signin);
  /**
   * Sign in form post.
   */
  app.post('/', routes.views.signin);
  /**
   * Signout route: Allows to control Signout user.
   */
  app.get('/signout', routes.views.signout); // get: render Sign out

  /**
   * API
   */
  app.use('/api/:function', require('./api.js'));

  /**
   * Top level page routes
   */
  
  // Basic
  app.get('/overview', routes.views.overview);
  app.get('/sonstiges', routes.views.sonstiges);
  app.get('/test', routes.views.test);
  app.get('/dashboard/:brewId', routes.views.dashboard); // Fermenter Dashboard
  app.all('/messenger/:brewId', routes.views.messenger);//Message Test

  // Admin
  app.get('/user', routes.views.user); // get render User view
  app.get('/trash', routes.views.trash); // get render Trash view with all deleted records

  /** ***************** MQTT ***************************************** */
  app.post('/mqtt/:cmd', routes.mqtt.mqttSend);
  /** ********************************************************************* */
  
  /** ***************** User ********************************************* */
  app.get('/modal/user/:id', routes.views.modals.user);
  // app.get('/user/:cmd/:id', routes.crud.user);
  app.post('/user/:cmd/:id', routes.crud.user);
  /** ********************************************************************* */

  /** ***************** Trash **************************************** */
  app.get('/trash/:section/:cmd', routes.views.trashedSection); // list all trashed items for a given Section
  app.get('/trash/:section/:cmd/:id', routes.crud.trash.updateTrashedItems); // Switch trashed value of an Item for given section
  /** **************************************************************** */
  app.use("/", (req, res) => res.redirect("/overview"));
};
