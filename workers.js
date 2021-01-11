const util = require('util');
const logsService = require('./src/service/responseLogService');

const debug = util.debuglog('workers');

const workers = {};

// Send check data to a log file
workers.log = function (originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck) {
  // Form the log data
  const logData = {
    check: originalCheckData,
    outcome: checkOutcome,
    state,
    alert: alertWarranted,
    time: timeOfCheck,
  };

  // Convert the data to a string
  const logString = JSON.stringify(logData);

  // Determine the name of the log file
  const logFileName = originalCheckData.id;

  // Append the log string to the file
  logsService.append(logFileName, logString, (err) => {
    if (!err) {
      debug('Logging to file succeeded');
    } else {
      debug('Logging to file failed');
    }
  });
};

// Rotate (compress) the log files
workers.rotateLogs = function () {
  // List all the (non compressed) log files
  logsService.list(false, (err, logs) => {
    if (!err && logs && logs.length > 0) {
      logs.forEach((logName) => {
        // Compress the data to a different file
        const logId = logName.replace('.log', '');
        const newFileId = `${logId}-${Date.now()}`;
        logsService.compress(logId, newFileId, (err) => {
          if (!err) {
            // Truncate the log
            logsService.truncate(logId, (err) => {
              if (!err) {
                debug('Success truncating logfile');
              } else {
                debug('Error truncating logfile');
              }
            });
          } else {
            debug('Error compressing one of the log files.', err);
          }
        });
      });
    } else {
      debug('Error: Could not find any logs to rotate');
    }
  });
};

// Timer to execute the log-rotation process once per day
workers.logRotationLoop = function () {
  setInterval(() => {
    workers.rotateLogs();
  }, 1000 * 60 * 60 * 24);
};

// Init script
workers.init = function () {
  // Send to console, in yellow
  console.log('\x1b[33m%s\x1b[0m', 'Background workers are running');

  // Compress all the logs immediately
  // workers.rotateLogs();

  // Call the compression loop so checks will execute later on
  // workers.logRotationLoop();
};

// Export the module
module.exports = workers;
