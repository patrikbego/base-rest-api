const utils = require('../utils');
const tokenService = require('./tokenService');
const userService = require('./userService');
const dataService = require('./dataService');
const mailgunService = require('./mailgunService');

const authService = {};

authService.login = async function (userData) {
  const reqUser = userService.convertDataToUserObject(userData);
  userData.getPassword = true;
  const userRes = await userService.getUser(userData, true);
  if (userRes && userRes.clientData
      && userRes.clientData.password === reqUser.password) {
    const tokenResObject = await tokenService.createToken(userData);

    const itemsListObject = await dataService.read(dataService.dirs.itemsDir,
      'itemsList');

    const responseObject = {
      token: tokenResObject.clientData,
      items: itemsListObject.clientData,
    };

    return utils.responseObject(200, 'User logged in ', responseObject);
  }
  return utils.responseObject(401, '', 'Phone of password are not correct!');
};

authService.logout = async function (data) {
  const reqToken = tokenService.convertDataToTokenObject(data);
  if (reqToken.id && reqToken.phone
      && await tokenService.isTokenValid(reqToken.id, reqToken.phone)) {
    const result = await tokenService.deleteToken(reqToken);
    return utils.responseObject(result.code, result.serverData,
      result.clientData);
  }
};

authService.signUp = async function (userData) {
  const userRes = await userService.createUser(userData);
  const tokenRes = await tokenService.createToken(userData);
  const link = `http://localhost:3000/confirmEmail?token=${
    tokenRes.clientData.id}&email=${userData.email}&phone=${userData.phone}`; // TODO encrypt this and on confirmation decrypt
  // TODO save link
  // send confirmation email
  mailgunService.template.confirmEmail.text += link;
  const mail = await mailgunService.sendEmail(
    mailgunService.template.confirmEmail,
  );
  console.log(mail);
  return utils.responseObject(200, '', 'Please confirm email');
};

authService.confirmEmail = async function (data) {
  const tokenRes = await tokenService.getToken(data);
  // TODO compare to the saved link and user email (this can be done also against user/phone/token) or add a counter
  if (tokenRes.code !== 200) {
    return utils.responseObject(400, '', 'Email confirmation failed');
  }
  // send confirmation email
  // TODO: set user status as confirmed
  return utils.responseObject(200, '', 'Email confirmed');
};

module.exports = authService;
