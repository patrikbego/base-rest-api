const dataService = require('./dataService');
const utils = require('../utils');

const userService = {};

// TODO add correct validation and return validData in the object
userService.convertDataToUserObject = function (userData) {
  const firstName = typeof (userData.firstName) === 'string'
  && userData.firstName.trim().length > 0
    ? userData.firstName.trim() : '';
  const lastName = typeof (userData.lastName) === 'string'
  && userData.lastName.trim().length > 0
    ? userData.lastName.trim() : '';
  const phone = typeof (userData.phone) === 'string'
  && userData.phone.trim().length > 3
    ? userData.phone.trim() : '';
  const email = typeof (userData.email) === 'string'
  && userData.email.trim().length > 0
    ? userData.email.trim() : false;
  const password = typeof (userData.password) === 'string'
  && userData.password.trim().length > 0
    ? utils.hash(userData.password.trim()) : '';
  const address = typeof (userData.address) === 'string'
  && userData.address.trim().length > 0
    ? userData.address.trim() : '';
  const tosAgreement = typeof (userData.tosAgreement) === 'boolean'
      && userData.tosAgreement === true;
  const id = utils.hash(phone);
  const status = 'NOT YET IMPLEMENTED'; // TODO
  const createdAt = Date.now();
  const updatedAt = Date.now();
  const lastActive = Date.now();

  return {
    id,
    firstName,
    lastName,
    phone,
    email,
    password,
    tosAgreement,
    address,
    status,
    createdAt,
    updatedAt,
    lastActive,
  };
};

userService.createUser = async function (userData) {
  console.log(`Creating user: ${userData.firstName} ${userData.lastName}`);

  const user = userService.convertDataToUserObject(userData);

  if (user.firstName && user.lastName && user.phone && user.password
      && user.tosAgreement) {
    if (dataService.exists(dataService.dirs.usersDir, user.id)) {
      return utils.responseObject(400, '',
        'User with this phone number already exists!');
    }
    try {
      console.log(
        `Creating user: ${user.firstName} ${user.lastName}`,
      );
      return await dataService.create(dataService.dirs.usersDir, user.id,
        user);
    } catch (err) {
      console.log(`File creation failed: ${err}`);
    }
  }
  return utils.responseObject(400, '', 'cu: User creation failed. cu');
};

userService.getUser = async function (userData) {
  const phone = typeof (userData.phone) === 'string'
  && userData.phone.trim().length > 7 ? userData.phone.trim() : false;
  const id = utils.hash(phone);
  console.log(`Retrieving user: ${id}`);
  const result = await dataService.read(dataService.dirs.usersDir, id);
  const user = result.clientData;
  if (!userData.getPassword) {
    user.password = '';
  }
  return utils.responseObject(200, '', user);
};

userService.getAllUsers = async function (createdAfterNrOfDays) {
  const result = await dataService.readAll(dataService.dirs.usersDir);
  const userList = result.clientData;
  const betweenList = [];
  if (createdAfterNrOfDays) {
    for (let i = 0; i < userList.length; i += 1) {
      const user = userList[i];
      if (user.createdAt > Date.now()
          - (1000 * 60 * 60 * 24 * createdAfterNrOfDays)) {
        betweenList.push(user);
      }
    }
  }
  return utils.responseObject(200, '',
    createdAfterNrOfDays ? betweenList : userList);
};

userService.getByEmail = async function (email) {
  const result = await dataService.readAll(dataService.dirs.usersDir);
  const userList = result.clientData;
  for (let i = 0; i < userList.length; i += 1) {
    const user = userList[i];
    if (user.email.toLowerCase().trim() === email.toLowerCase().trim()) {
      return utils.responseObject(200, '', user);
    }
  }
  return utils.responseObject(200, '', 'Not Found');
};

userService.updateUser = async function (userData) {
  console.log(`Updating user: ${userData.firstName} ${userData.lastName}`);
  const user = userService.convertDataToUserObject(userData);
  if (user.firstName && user.lastName && user.phone
      && user.tosAgreement
      && dataService.exists(dataService.dirs.usersDir, user.id)) {
    const orginalUser = await dataService.read(dataService.dirs.usersDir,
      user.id);
    console.log(
      `Updating user: ${user.firstName} ${user.lastName}`,
    );
    if (orginalUser.phone !== user.phone) {
      utils.responseObject(200, '', 'Phone number can\'t  be updated!');
    }
    if (orginalUser.password !== utils.hash(user.password.trim())) {
      utils.responseObject(200, '', 'Requested data can\'t  be updated!');
    }
    return await dataService.update(dataService.dirs.usersDir, user.id, user);
  }
};

userService.deleteUser = async function (userData) {
  userData.phone.trim().length > 7
    ? userData.phone.trim() : '';
  const phone = typeof (userData.phone) === 'string'
  && userData.phone.trim().length > 7
    ? userData.phone.trim() : false;
  console.log(`Deleting user: ${userData.phone}`);
  const id = utils.hash(phone);
  return await dataService.delete(dataService.dirs.usersDir, id);
};

module.exports = userService;
