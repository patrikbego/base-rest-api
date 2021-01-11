const userService = require('./service/userService');
const tokenService = require('./service/tokenService');
const authService = require('./service/authService');
const stripeService = require('./service/stripeService');
const itemsService = require('./service/itemsService');
const utils = require('./utils');
const orderService = require('./service/orderService');

const routeHandler = {};

const route = {
  async notFound() {
    return utils.responseObject(404, '', 'This path does not exist!');
  },
  async getUser(data, headers) {
    data.getPassword = false;
    const token = utils.extractTokenFromHeaders(headers);
    return await utils.requestWrapper(userService.getUser, { phone: token.phone },
      headers,
      tokenService.isRequestTokenValid, true);
  },
  async updateUser(data, headers) {
    return await utils.requestWrapper(userService.updateUser, data, headers,
      tokenService.isRequestTokenValid, true);
  },
  async deleteUser(data, headers) {
    return await utils.requestWrapper(userService.deleteUser, data, headers,
      tokenService.isRequestTokenValid, true);
  },
  async createUser(data, headers) {
    return await utils.requestWrapper(userService.createUser, data, headers,
      tokenService.isRequestTokenValid, false);
  },
  async getToken(data, headers) {
    return await utils.requestWrapper(tokenService.getToken, data, headers,
      tokenService.isRequestTokenValid, true);
  },
  async updateToken(data, headers) {
    return await utils.requestWrapper(tokenService.updateToken, data, headers,
      tokenService.isRequestTokenValid, true);
  },
  async deleteToken(data, headers) {
    return await utils.requestWrapper(tokenService.deleteToken, data, headers,
      tokenService.isRequestTokenValid, true);
  },
  async createToken(data, headers) {
    return await utils.requestWrapper(tokenService.createToken, data, headers,
      tokenService.isRequestTokenValid, false);
  },
  async login(data, headers) {
    const base64Credentials = headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64')
      .toString('ascii');
    const [username, password] = credentials.split(':');
    data = { phone: username, password };
    return await utils.requestWrapper(authService.login, data, headers,
      tokenService.isRequestTokenValid, false);
  },
  async logout(data, headers) {
    const token = utils.extractTokenFromHeaders(headers);
    return await utils.requestWrapper(authService.logout, token, headers,
      tokenService.isRequestTokenValid, true);
  },
  async signUp(data, headers) {
    return await utils.requestWrapper(authService.signUp, data, headers,
      tokenService.isRequestTokenValid, false);
  },
  async confirmEmail(data, headers) {
    return await utils.requestWrapper(authService.confirmEmail, data, headers,
      tokenService.isRequestTokenValid, false);
  },
  async makePayment(data, headers) {
    const orderData = await orderService.createOrder(data);
    const confirmPayment = await utils.requestWrapper(stripeService.makePayment, data, headers,
      tokenService.isRequestTokenValid, true);
    await orderService.updateOrder(data, 'PROCESSED', confirmPayment.clientData);
    return confirmPayment;
  },
  async getItems(data, headers) {
    return await utils.requestWrapper(itemsService.getItems, data, headers,
      tokenService.isRequestTokenValid, false);
  },
  async addItem(data, headers) {
    return await utils.requestWrapper(itemsService.addItem, data, headers,
      tokenService.isRequestTokenValid, true);
  },
  async deleteItems(data, headers) {
    return await utils.requestWrapper(itemsService.deleteItem, data, headers,
      tokenService.isRequestTokenValid, true);
  },
  async ping() {
    return utils.responseObject(200, 'Server is up', 'OK');
  },
};

routeHandler.router = function (trimmedPath, method) {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(method) > -1) {
    trimmedPath += `/${method}`;
  } else if (method === 'options') {
    return route.ping;
  }

  switch (trimmedPath) {
    case 'getUser/get':
      return route.getUser;
      // case 'createUser/post':
      //   return route.createUser;
    case 'updateUser/put':
      return route.updateUser;
    case 'deleteUser/delete':
      return route.deleteUser;

    case 'getToken/get':
      return route.getToken;
    case 'createToken/post':
      return route.createToken;
    case 'updateToken/put':
      return route.updateToken;
    case 'deleteToken/delete':
      return route.deleteToken;

    case 'login/post':
      return route.login;
    case 'logout/post':
      return route.logout;
    case 'signup/post':
      return route.signUp;
    case 'confirmEmail/post':
      return route.confirmEmail;

    case 'makePayment/post':
      return route.makePayment;

    case 'getItems/get':
      return route.getItems;
    case 'addItem/post':
      return route.addItem;
    case 'deleteItems/delete':
      return route.deleteItems;

    case 'ping/get':
      return route.ping;
    default:
      return route.notFound;
  }
};

module.exports = routeHandler;
