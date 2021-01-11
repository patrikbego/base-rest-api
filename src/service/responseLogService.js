const fs = require('fs');
const zlib = require('zlib');
const dataService = require('./dataService');

const responseLogService = {};

responseLogService.dir = `${dataService.baseDir}/${dataService.dirs.logsDir}/`;

responseLogService.append = function (file, data) {
  if (!dataService.exists(dataService.dirs.logsDir, file)) {
    dataService.create(dataService.dirs.logsDir, file, data).catch((r) => { console.log(`Log could not be created${r.serverData}`); });
  } else {
    dataService.update(dataService.dirs.logsDir, file, data, true).catch((r) => { console.log(`Log could not be updated${r.serverData}`); });
  }
};

// List all the logs, and optionally include the compressed logs
responseLogService.list = function (includeCompressedLogs, callback) {
  fs.readdir(`${dataService.baseDir}/${dataService.dirs.logsDir}`, (err, data) => {
    if (!err && data && data.length > 0) {
      const trimmedFileNames = [];
      data.forEach((fileName) => {
        // Add the .log files
        if (fileName.indexOf('.log') > -1) {
          trimmedFileNames.push(fileName.replace('.log', ''));
        }

        // Add the .gz files
        if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
          trimmedFileNames.push(fileName.replace('.gz.b64', ''));
        }
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
};

// Compress the contents of one .log file into a .gz.b64 file within the same directory
responseLogService.compress = function (logId, newFileId, callback) {
  const sourceFile = `${logId}.log`;
  const destFile = `${newFileId}.gz.b64`;

  // Read the source file
  fs.readFile(responseLogService.dir + sourceFile, 'utf8', (err, inputString) => {
    if (!err && inputString) {
      // Compress the data using gzip
      zlib.gzip(inputString, (err, buffer) => {
        if (!err && buffer) {
          // Send the data to the destination file
          fs.open(responseLogService.dir + destFile, 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
              // Write to the destination file
              fs.writeFile(fileDescriptor, buffer.toString('base64'),
                (err) => {
                  if (!err) {
                    // Close the destination file
                    fs.close(fileDescriptor, (err) => {
                      if (!err) {
                        callback(false);
                      } else {
                        callback(err);
                      }
                    });
                  } else {
                    callback(err);
                  }
                });
            } else {
              callback(err);
            }
          });
        } else {
          callback(err);
        }
      });
    } else {
      callback(err);
    }
  });
};

// Decompress the contents of a .gz file into a string variable
responseLogService.decompress = function (fileId, callback) {
  const fileName = `${fileId}.gz.b64`;
  fs.readFile(responseLogService.dir + fileName, 'utf8', (err, str) => {
    if (!err && str) {
      // Inflate the data
      const inputBuffer = Buffer.from(str, 'base64');
      zlib.unzip(inputBuffer, (err, outputBuffer) => {
        if (!err && outputBuffer) {
          // Callback
          const str = outputBuffer.toString();
          callback(false, str);
        } else {
          callback(err);
        }
      });
    } else {
      callback(err);
    }
  });
};

// Truncate a log file
responseLogService.truncate = function (logId, callback) {
  fs.truncate(`${responseLogService.dir + logId}.log`, 0, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback(err);
    }
  });
};

// Export the module
module.exports = responseLogService;
