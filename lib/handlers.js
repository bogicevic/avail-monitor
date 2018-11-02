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
            !err ? cb(500, { 'Error': 'Could not update the user' }) : cb(200, { 'Success': 'User updated' });
          });
        } else {
          cb(400, { 'Error': 'Specified user does not exist' });
        }
      });
    } else {
      cb(400, { 'Error': 'No fields to update provided' })
    }

  } else {
    cb(400, { 'Error': 'Missing required phone field' });
  }
}

handlers._users.delete = (data, cb) => {
  const phoneNo = data.queryStringObject.phone;
  const phone = typeof (phoneNo) === 'string' && phoneNo.trim().length === 10
    ? phoneNo.trim()
    : false;
  if (phone) {
    _data.read('users', phone, (err, data) => {
      if (!err && data) {
        _data.delete('users', phone, (err) => {
          err ? cb(200, { 'Success': 'User deleted' }) : cb(500, { 'Error': 'Could not delete specified user' });
        });
      } else {
        cb(400, { 'Error': 'Could not find specified user' });
      }
    })
  } else {
    cb(400, { 'Error': 'Missing required phone number' });
  }
}

handlers.tokens = (data, cb) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, cb);
  } else {
    cb(405);
  }
}

handlers._tokens = {};

handlers._tokens.post = (data, cb) => {
  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10
    ? data.payload.phone.trim()
    : false;
  let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0
    ? data.payload.password.trim()
    : false;
  if (phone && password) {
    _data.read('users', phone, (err, userData) => {
      if(!err && userData) {
        let hashedPassword = helpers.hash(password);
        if (hashedPassword ===userData.hashedPassword) {
          let tokenId = helpers.createRandomString(20);
          let expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            phone,
            id: tokenId,
            expires,
          };

          _data.create('tokens', tokenId, tokenObject, (err) => {
            if(err) {
              cb(200, tokenObject);
            } else {
              cb(500, {'Error': 'Could not create new token'});
            }
          })
        } else {
          cb(400, {'Error': 'Passwords don\'t match' });
        }
      } else {
        cb(400, {'Error': 'Could not find specified user'});
      }
    });
  } else {
    cb(400, { 'Error': 'Missing required fields' });
  }
}

handlers._tokens.get = (data, cb) => {
  const idQs = data.queryStringObject.id;
  const id = typeof (idQs) === 'string' && idQs.trim().length === 20
    ? idQs.trim()
    : false;
  if (id) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        cb(200, tokenData);
      } else {
        cb(404, { 'Error': 'Provided ID not found' });
      }
    })
  } else {
    cb(400, { 'Error': 'Missing required ID' });
  }
}

// No other reason to update tokens, than extending expiration time
handlers._tokens.put = (data, cb) => {
  let id = typeof (data.payload.id) === 'string' && data.payload.id.trim().length === 20
  ? data.payload.id.trim()
  : false;
  let extend = typeof (data.payload.extend) === 'boolean' && data.payload.extend === 'true'
  ? true // TODO: Vi'de ovo dal treba, il samo 222. Vratice true or false ionako.
  : false;

  if (id && extend) {
    _data.read('tokens', id, (err, tokenData) => {
      if(!err && tokenData) {
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          _data.update('tokens', id, tokenData, (err) => {
            if(!err){
              cb(200, {'Success': 'Token extended'});
            } else {
              cb(500, {'Error': 'Token extension failed. Wrong on our side.'});
            }
          })
        } else {
          cb(400, {'Error': 'Token expired. Cannot be extended.'});
        }
      } else {
        cb(400, {'Error': 'Token does not exist'});
      }
    });
  } else {
    cb(400, {'Error': 'Missing reqired fields || invalid fields'});
  }
}

handlers._tokens.delete = (data, cb) => {

}

handlers.ping = (data, callback) => {
  callback(200, { 'Ping': 'Success' });
}

handlers.sample = (data, callback) => {
  callback(406, { 'name': 'sample handler' });
};

handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
