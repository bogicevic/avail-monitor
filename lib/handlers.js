/**
 * Request handlers
 * 
 */

const handlers = {};

handlers.users = (data, cb) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1){
    handlers._users[data.method](data, cb);
  } else {
    cb(405);
  }
}

handlers._users = {};

handlers._users.post = (data, cb) => {
  
}

handlers._users.get = (data, cb) => {

}

handlers._users.put = (data, cb) => {

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