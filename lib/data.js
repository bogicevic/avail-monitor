const fs = require('fs');
const path = require('path');

const lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = (dir, file, data, cb) => {
  fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      let stringData = JSON.stringify(data);
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              cb(`${file}.json created in ${dir} folder`);
            } else {
              cb('Error closing new file');
            }
          });
        } else {
          cb('Error writing to new file');
        }
      });
    } else {
      cb('Could not create new file, it may already exist');
    }
  });
};

lib.read = (dir, file, cb) => {
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
    cb(err, data);
  });
}

lib.update = (dir, file, data, cb) => {
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
    if (err && !fileDescriptor) {
      cb('Unable to open file, might not exist yet')
    }

    let stringData = JSON.stringify(data);

    fs.truncate(fileDescriptor, (err) => {
      if(err) {
        cb('Error truncating file', err);
      }
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if(err) {
          cb('Error writing to existing file', err);
        }
        fs.close(fileDescriptor, (err) => {
          err ? cb('Error closing file', err) : cb(`${file}.json updated!`);
        })
      })
    })

  });
}

lib.delete = (dir, file, cb) => {
  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (err) => {
    err ? cb(`Error deleting ${file}.json`) : cb(`${file}.json deleted!`);
  });
}

module.exports = lib;
