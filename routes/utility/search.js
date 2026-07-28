/**
 * Search API
 * @module routes/search
 */


const keystone = require('keystone');
const _ = require('lodash');
const middleware = require('../middleware');

const options = {};

/**
 * takes search request and returns searched objects
 * @param req
 * @param res
 * @post
 */
function search(req, res, options, next) {
  if (options.lists && options.searchValue) {
    let results = [];
    let numToCheck = 0;
    let isError = null;
    let sort = '-createdAt';

    if (req.query.sort) {
      sort = req.query.sort;
    }

    res.locals.sort = sort;

    _.each(options.lists, (searchList, index) => {
      // console.log(index, list);

      if (searchList !== 'User') {
        numToCheck++;

        isError = `${searchList} is no valid list`;

        if (numToCheck === options.lists.length) {
          return res.send(isError);
        }
      } else {
        const List = keystone.list(searchList);

        const regex = options.searchValue.split('+');
        const limit = Math.floor(Number(options.limit) / options.lists.length) || 99;
        let query = List.model.find();

        _.each(regex, (regexItem, regexIndex) => {
          const regexObj = new RegExp(regexItem, 'i');

          switch (searchList) {            
            case 'User':
              if (isNaN(options.searchValue)) {
                query = query.and({ $or: [{ 'name.first': regexObj }, { 'name.last': regexObj }, { email: regexObj }], $and: [{ isTrashed: false }] });
              } else {
                query = query.and({ $or: [{ 'name.first': regexObj }, { 'name.last': regexObj }, { email: regexObj }], $and: [{ isTrashed: false }] });
              }

              break;
            default:
              query = query.and(regexObj);
          }
        });
        query.sort(sort).limit(limit).exec((err, items) => {
          if (err) isError = err;

          results = results.concat(items);

          numToCheck++;

          if (numToCheck === options.lists.length) {
            if (isError) return res.send(isError);

            return next(results);
          }
        });
      }
    });
  } else {
    return res.send('Please define search options');
  }
}

function searchExternal(req, res) {
  search(req, res, req.body, (results) => res.send(results));
}

/**
 * Prepare content for signed in user
 * @type {module.exports}
 */
module.exports = {
  external(req, res) {
    middleware.requireAllowedUser(req, res, searchExternal);
  },
  internal(req, res, options, next) {
    search(req, res, options, next);
  },
};
