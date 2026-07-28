const keystone = require('keystone');
const _ = require('lodash');

const objectIdDel = (copiedObjectWithId, fields, currentKey = null) => {
  if (copiedObjectWithId != null && typeof (copiedObjectWithId) !== 'string'
    && typeof (copiedObjectWithId) !== 'number' && typeof (copiedObjectWithId) !== 'boolean') {
    // for array length is defined however for objects length is undefined
    if (typeof (copiedObjectWithId.length) === 'undefined') {
      if (currentKey === null || fields.indexOf(currentKey) >= 0) {
        delete copiedObjectWithId._id;
        delete copiedObjectWithId.__v;
      }
      _.each(Object.keys(copiedObjectWithId), (key) => {
        // recursive del calls on object elements
        objectIdDel(copiedObjectWithId[key], fields, key);
      });
    } else {
      for (let i = 0; i < copiedObjectWithId.length; i++) {
        // recursive del calls on array elements
        objectIdDel(copiedObjectWithId[i], fields, currentKey);
      }
    }
  }
};

const saveRefs = (refObj, callback) => {
  const saveOperations = [];
  Object.keys(refObj).forEach((key) => {
    const list = keystone.list(key);
    refObj[key].forEach((obj) => {
      const ObjectToSave = new list.model(obj);
      // console.log('TRY TO SAVE', key, obj);
      const SaveOperation = new Promise((resolve, reject) => {
        ObjectToSave.save((err, savedObj) => {
          if (err) return reject(err);
          return resolve({ type: savedObj.type, _id: savedObj._id });
        });
      });
      saveOperations.push(SaveOperation);
    });
  });
  Promise.all(saveOperations).then((result) => {
    const returnObj = {};
    result.forEach((resultObj) => {
      if (!returnObj[resultObj.type]) returnObj[resultObj.type] = [];
      returnObj[resultObj.type].push(resultObj._id);
    });
    callback(returnObj);
  }).catch((e) => console.log(e));
};

module.exports = {
  objectIdDel,
  saveRefs,
};
