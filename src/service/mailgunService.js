const config = require('../../config.local');

const { username } = config.mailgun;
const { password } = config.mailgun;
const { authorization } = config.mailgun;
const { domain } = config.mailgun;

const utils = require('../utils');

const mailgunService = {};
mailgunService.template = {};
mailgunService.template.paymentConfirmed = {
  from: `postmaster@${domain}`,
  to: 'patrik.delo@gmail.com',
  subject: 'Hello Patrik Delo',
  text: 'Payment has been confirmed!',
};

mailgunService.template.confirmEmail = {
  from: `postmaster@${domain}`,
  to: 'patrik.delo@gmail.com',
  subject: 'Hello Patrik Delo',
  text: 'Please confirm email by clicking on link: ',
};

mailgunService.sendEmail = async function (body) {
  const options = {
    hostname: 'api.mailgun.net',
    port: 443,
    path: `/v3/${domain}/messages?${
      utils.objectToParams(body)}`,
    auth: {
      username,
      password,
    },
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  };
  try {
    const result = await utils.requestAsync(options);
    return utils.responseObject(200, '', result);
  } catch (e) {
    console.log(e);
    return utils.responseObject(400, '', 'Email failed being sent.');
  }
};

module.exports = mailgunService;
