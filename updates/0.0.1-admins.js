/**
 * This script automatically creates a default Admin user when an
 * empty database is used for the first time. You can use this
 * technique to insert data into any List you have defined.
 *
 * Alternatively, you can export a custom function for the update:
 * module.exports = function(done) { ... }
 */

exports.create = {
  User: [
    {
      'name.first': 'Patrick',
      'name.last': 'Blättermann',
      email: 'patrick.blaettermann@hs-duesseldorf.de',
      password: '1234',
      isAdmin: true,
      isEditor: true,
      isEnabled: true,
      isTrashed: false,
    }, {
      'name.first': 'Admin',
      'name.last': 'Admin',
      email: 'admin@hs-duesseldorf.de',
      password: 'admin',
      isAdmin: true,
      isEditor: true,
      isEnabled: true,
      isTrashed: false,
    }, {
      'name.first': 'View',
      'name.last': 'View',
      email: 'View',
      password: 'View',
      isAdmin: false,
      isEditor: false,
      isEnabled: true,
      isTrashed: false,
    },
    {
      'name.first': 'Jim',
      'name.last': 'Bob',
      email: 'jimbob@gmail.com',
      password: '1234',
      isAdmin: false,
      isEditor: false,
      isEnabled: true,
      isTrashed: false,
    }
  ],
};
