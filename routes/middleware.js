const keystone = require('keystone');
const Status = keystone.list('Status');

/**
 *
 * @module routes/middleware
 */
const _ = require('lodash');

/**
 * locals is the main Object that jade/pug references to it.
 *  Initialises the standard view 'locals'.
 * @param req (object) reques object
 * @param res (object)    response object
 * @param next (function)    callback
 */
exports.initLocals = async function(req, res, next) {

  const fermenters = await new Promise((resolve) => Status.model.find().distinct("brewId").exec(async (err, data) => {
    resolve(data);
  }));

  const fermenterLinks = [];
  for (const id of fermenters) {
    fermenterLinks.push({ 
      label: await req.getFermenterName(id), 
      key: `fermenter-${id}`, 
      href: `/dashboard/${id}`
    });
  }

  res.locals.section = req.url;

  /**
   * Links/Routes in navbar
   * @type {[*]}
   */
  res.locals.navLinks = [
  { label: 'Dashboard Overview', key: 'overview', href: '/overview' },
  { label: 'Test', key: 'test', href: '/test' },
  ...fermenterLinks
];
  /**
   * Current user (if someone is already signed in)
   */
  res.locals.user = req.user;

  next();
};

/**
 * Fetches and clears the flashMessages before a view is rendered
 * @param req (object) reques object
 * @param res (object)    response object
 * @param next (function)    callback
 */
exports.flashMessages = function (req, res, next) {
  /**
   * Type if Flash Message , matches with bootstraps alert container suffix
   * @type {{info: *, success: *, warning: *, error: *}}
   */
  const flashMessages = {
    info: req.flash('info'),
    success: req.flash('success'),
    warning: req.flash('warning'),
    error: req.flash('error'),
  };
  /**
   * determine if is there any already assigned Flash messges.
   */
  res.locals.messages = _.some(flashMessages, (msgs) => msgs.length) ? flashMessages : false;
  next();
};

/**
 * Prevents people from accessing protected pages when they're not signed in (User)
 * @param req
 * @param res
 * @param next
 */
exports.requireAllowedUser = function (req, res, next) {
  if (!req.user || !req.user.canAccessDashboard) {
    req.flash('error', 'Please sign in to access this page.');

    res.redirect('/');
  } else {
    next(req, res);
  }
};

/**
 * Prevents people from accessing protected pages when they're not signed in (Editor)
 * @param req
 * @param res
 * @param next
 */
exports.requireAllowedEditor = function (req, res, next) {
  if (!req.user || !req.user.canAccessEdit) {
    req.flash('error', 'Please sign in as editor to access this page.');

    res.redirect('/');
  } else {
    next(req, res);
  }
};

/**
 * Prevents people from accessing protected pages when they're not signed in (Admin)
 * @param req
 * @param res
 * @param next
 */
exports.requireAllowedAdmin = function (req, res, next) {
  if (!req.user || !req.user.canAccessUser) {
    req.flash('error', 'Please sign in as admin to access this page.');

    res.redirect('/');
  } else {
    next(req, res);
  }
};
