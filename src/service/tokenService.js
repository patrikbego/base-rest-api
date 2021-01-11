const utils = require('../utils');
const dataService = require('./dataService');

const tokeService = {};

tokeService.convertDataToTokenObject = function (data) {
  const phone = typeof (data.phone) === 'string'
  && data.phone.trim().length > 7
    ? data.phone.trim() : '';
  const id = typeof (data.id) === 'string'
  && data.id.trim().length === 20 ? data.id.trim() : '';
  const extend = typeof (data.extend) === 'boolean'
      && data.extend === true;
  return {
    phone,
    id,
    extend,
  };
};

tokeService.createToken = async function (userData) {
  const phone = typeof (userData.phone) === 'string'
  && userData.phone.trim().length > 7
    ? userData.phone.trim() : '';
  const password = typeof (userData.password) === 'string'
  && userData.password.trim().length > 0
    ? userData.password.trim() : '';

  const id = utils.hash(phone);
  if (phone && password
      && dataService.exists(dataService.dirs.usersDir, id)) {
    const userRes = await dataService.read(dataService.dirs.usersDir, id);

    if (utils.hash(password) === userRes.clientData.password) {
      const tokenId = utils.createRandomString(20);
      const expires = Date.now() + 1000 * 60 * 60;
      const tokenObject = {
        phone,
        id: tokenId,
        expires,
      };

      const response = await dataService.create(dataService.dirs.tokensDir,
        tokenId,
        tokenObject);
      return utils.responseObject(response.code, response.serverData,
        tokenObject);
    }
  }
};

tokeService.getToken = async function (data) {
  const reqToken = tokeService.convertDataToTokenObject(data);
  const isTokenValid = await tokeService.isTokenValid(reqToken.id,
    reqToken.phone);
  if (reqToken.id && reqToken.phone && isTokenValid) {
    const result = await dataService.read(dataService.dirs.tokensDir,
      reqToken.id);
    return utils.responseObject(result.code, result.serverData,
      result.clientData);
  }
  return utils.responseObject(400, '', 'Could not retrieve token.');
};

tokeService.updateToken = async function (data) {
  const reqToken = tokeService.convertDataToTokenObject(data);
  if (data.id && data.extend
      && await tokeService.isTokenValid(reqToken.id, reqToken.phone)) {
    const token = await dataService.read(dataService.dirs.tokensDir,
      reqToken.id);
    if (token.clientData.expires > Date.now()) {
      const tokenId = token.clientData.id;
      const expires = Date.now() + 1000 * 60 * 60;
      const tokenObject = {
        phone: token.clientData.phone,
        id: tokenId,
        expires,
      };

      return await dataService.update(dataService.dirs.tokensDir, tokenId,
        tokenObject);
    }
  }
};

tokeService.deleteToken = async function (data) {
  const reqToken = tokeService.convertDataToTokenObject(data);
  if (reqToken.id && reqToken.phone
      && await tokeService.isTokenValid(reqToken.id, reqToken.phone)) {
    const result = await dataService.delete(dataService.dirs.tokensDir,
      reqToken.id);
    return utils.responseObject(result.code, result.serverData,
      'Token deleted successfully!');
  }
  return utils.responseObject(400, '', 'Could not retrieve token.');
};

tokeService.isTokenValid = async function (id, phone) {
  if (dataService.exists(dataService.dirs.tokensDir, id) && phone) {
    const result = await dataService.read(dataService.dirs.tokensDir, id);
    return result.clientData.phone === phone
        && result.clientData.expires > Date.now();
  }
};

tokeService.isRequestTokenValid = async function (headers) {
  const token = utils.extractTokenFromHeaders(headers);

  if (token) {
    const reqToken = await dataService.read(dataService.dirs.tokensDir, token.id);
    if (reqToken.clientData.id && reqToken.clientData.phone
        && reqToken.clientData.expires > Date.now()) {
      return true;
    }
  } else {
    return false;
  }
};

module.exports = tokeService;
