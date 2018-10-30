/**
 * Request handlers
 * 
 */
const helpers = require('./helpers')
const _data = require('./data');

const handlers = {};

handlers.users = (data, cb) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, cb);
  } else {
    cb(405);
  }
}

handlers._users = {};

handlers._users.post = (data, cb) => {
  let firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0
    ? data.payload.firstName.trim()
    : false;
  let lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0
    ? data.payload.lastName.trim()
    : false;
  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10
    ? data.payload.phone.trim()
    : false;
  let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0
    ? data.payload.password.trim()
    : false;
  let tosAgreement = typeof (data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true
    ? true
    : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    _data.read('users', phone, (err, data) => {
      if (err) {
        let hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          const userObject = {
            firstName,
            lastName,
            phone,
            hashedPassword,
            tosAgreement: true,
          };

          _data.create('users', phone, userObject, (err) => {
            !err ? cb(500, { 'Error': 'Could not create new user' }) : cb(200, { 'Success': 'User created' });
          });
        } else {
          cb(500, { 'Error': 'Could not hash user\'s password' });
        }

      } else {
        cb(400, { 'Error': `User with phone number ${phone} already exists` });
      }
    });
  } else {
    cb(400, { 'Error': 'Missing required field' });
  }
}

handlers._users.get = (data, cb) => {
  const phoneNo = data.queryStringObject.phone;
  const phone = typeof (phoneNo) === 'string' && phoneNo.trim().length === 10
    ? phoneNo.trim()
    : false;
  if (phone) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        delete data.hashedPassword;
        cb(200, data);
      } else {
        cb(404, { 'Error': 'Provided Phone No not found' });
      }
    })
  } else {
    cb(400, { 'Error': 'Missing required phone number' });
  }
}

handlers._users.put = (data, cb) => {
  let firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0
    ? data.payload.firstName.trim()
    : false;
  let lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0
    ? data.payload.lastName.trim()
    : false;
  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10
    ? data.payload.phone.trim()
    : false;
  let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0
    ? data.payload.password.trim()
    : false;

  if (phone) {
    if (firstName || lastName || password) {
      _data.read('users', phone, (err, userData) => {
        if (!err && userData) {
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }
          _data.update('users', phone, userData, (err) => {
            !err ? cb(500, {'Error': 'Could not update the user'}) : cb(200);
          });
        } else {
          cb(400, {'Error': 'Specified user does not exist'});
        }
      });
    } else {
      cb(400, {'Error': 'No fields to update provided'})
    }

  } else {
    cb(400, {'Error': 'Missing required phone field'});
  }
}

handlers._users.delete = (data, cb) => {

}

handlers.ping = (data, callback) => {
  callback(200);
}

handlers.sample = (data, callback) => {
  callback(406, { 'name': 'sample handler' });
};

handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
