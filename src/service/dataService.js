const fs = require('fs');
const path = require('path');
const utils = require('../utils');

const jsonFile = {};

jsonFile.dirs = {
  usersDir: 'users',
  tokensDir: 'tokens',
  itemsDir: 'items',
  ordersDir: 'orders',
  logsDir: 'logs',
};

jsonFile.baseDir = path.join(__dirname, '/../.tempJsonStorage');

jsonFile.create = async function (dir, file, data) {
  const jsonData = JSON.stringify(data);
  let fileHandle;
  try {
    fileHandle = await fs.promises.open(
      `${jsonFile.baseDir}/${dir}/${file}.json`, 'wx',
    )
      .then((res) => fs.promises.writeFile(res, jsonData));
    return utils.responseObject(200, '', 'Data created successfully');
  } catch (err) {
    const message = `Writing of file (${file}) failed: ${err}`;
    console.error(message);
    console.trace(err);
    return utils.responseObject(500, message, 'Could not create new data!');
  } finally {
    if (fileHandle !== undefined) {
      await fileHandle.close();
    }
  }
};

jsonFile.read = async function (dir, fileName) {
  try {
    const object = await fs.promises.readFile(
      `${jsonFile.baseDir}/${dir}/${fileName}.json`,
      'utf8',
    );
    return utils.responseObject(200, 'File found', JSON.parse(object));
  } catch (err) {
    const message = `File does not exist: ${err}`;
    console.error(message);
    console.trace(err);
    return utils.responseObject(500, message, 'Could not find requested data!');
  }
};

jsonFile.readAll = async function (dir) {
  try {
    const fileList = await fs.promises.readdir(
      `${jsonFile.baseDir}/${dir}/`,
      'utf8',
    );
    const objectPromiseList = [];
    for (let i = 0; i < fileList.length; i += 1) {
      const object = fs.promises.readFile(
        `${jsonFile.baseDir}/${dir}/${fileList[i].trim()}`, 'utf8',
      );
      objectPromiseList.push(object);
    }
    const objectJsonList = await Promise.all(objectPromiseList);
    const objectList = [];
    objectJsonList.forEach((o) => objectList.push(JSON.parse(o)));
    return utils.responseObject(200, 'File found', JSON.parse(JSON.stringify(objectList)));
  } catch (err) {
    const message = `File does not exist: ${err}`;
    console.error(message);
    console.trace(err);
    return utils.responseObject(500, message, 'Could not find requested data!');
  }
};

jsonFile.exists = function (dir, fileName) {
  try {
    if (fs.existsSync(`${jsonFile.baseDir}/${dir}/${fileName}.json`)) {
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
};

jsonFile.update = async function (dir, file, data, append) {
  const jsonData = JSON.stringify(data);
  let fileHandle;
  const filePath = `${jsonFile.baseDir}/${dir}/${file}.json`;
  try {
    await (async () => {
      console.log('update started');
      fileHandle = await fs.promises.open(filePath, 'r+');
      if (!append) {
        await fs.promises.truncate(filePath, 0);
      }
      await fs.promises.writeFile(fileHandle, jsonData);
      console.log('update finished');
    })();
    return utils.responseObject(200, 'File updated successfully', 'Data updated successfully!');
  } catch (err) {
    const message = `Updating of file (${file}) failed: ${err}`;
    console.error(message);
    console.trace(err);
    return utils.responseObject(500, message, 'Data could not be updated!');
  } finally {
    if (fileHandle !== undefined) {
      await fileHandle.close();
    }
  }
};

jsonFile.delete = async function (dir, file) {
  try {
    await fs.promises.unlink(
      `${jsonFile.baseDir}/${dir}/${file}.json`,
    );
    return utils.responseObject(200, '', 'Data deleted successfully!');
  } catch (err) {
    const message = `File does not exist: ${err}`;
    console.error(message);
    console.trace(err);
    return utils.responseObject(500, message, 'Could not delete data!');
  }
};

module.exports = jsonFile;
