const fs = require('fs');
const path = require('path');

const lib = {};

lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = (dir, file, data, cb) => {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            let stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if(!err){
                    fs.close(fileDescriptor, (err) => {
                        if(!err){
                            cb(false);
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

module.exports = lib;
