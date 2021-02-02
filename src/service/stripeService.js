const utils = require('../utils');
const mailgunService = require('./mailgunService');
const config = require('../../config.local');

const stripeService = {};

const { authorization } = config.stripe;
const { pubKey } = config.stripe;

const options = {
  hostname: 'api.stripe.com',
  port: 443,
  path: '',
  body: '',
  headers: {
    Authorization: authorization,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  method: 'POST',
};

async function resolveHttp() {
  try {
    const result = await utils.requestAsync(options);
    const pmRes = JSON.parse(result);
    if (pmRes.error) return utils.responseObject(400, '', pmRes.error.code);
    return utils.responseObject(200, '', result);
  } catch (e) {
    console.log(e);
    return utils.responseObject(400, '', 'Payment failed.');
  }
}

stripeService.createPaymentMethod = async function (data) {
  // type=card&card[number]=4242424242424242&card[exp_month]=1&card[exp_year]=2022&card[cvc]=314
  const params = utils.objectToParams(data.card);
  options.path = `/v1/payment_methods?${params}`;
  return await resolveHttp();
};

stripeService.makePaymentWithMethod = async function (res, data) {
  // amount=1000&currency=usd&payment_method_types[]=card&receipt_email=asdf.delo@gmail.com&confirmation_method=manual&confirm=true
  const params = utils.objectToParams(data.transaction);
  options.path = `/v1/payment_intents?${params
  }&payment_method=${JSON.parse(res.clientData).id}`;
  // const orderAmount = calculateOrderAmount([1, 2, 3]);
  return await resolveHttp();
};

stripeService.confirmPayment = async function (res) {
  const po = JSON.parse(res.clientData);
  options.path = `/v1/payment_intents/${po.id
  }?key=${pubKey}&is_stripe_sdk=false&client_secret=${
    po.client_secret}`;
  options.method = 'GET';
  return await resolveHttp();
};

const generateResponse = (intent) => {
  switch (intent.status) {
    case 'requires_action':
    case 'requires_source_action':
      // Card requires authentication
      return {
        requiresAction: true,
        clientSecret: intent.client_secret,
      };
    case 'requires_payment_method':
    case 'requires_source':
      // Card was not properly authenticated, suggest a new payment method
      return {
        error: 'Your card was denied, please provide a new payment method',
      };
    case 'succeeded':
      // Payment is complete, authentication not required
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
      console.log('💰 Payment received!');
      return { clientSecret: intent.client_secret };
  }
};

function calculateOrderAmount(items) {
  // todo
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += items[i];
  }
  return sum;
}

stripeService.makePayment = async function (data) {
  try {
    console.log(`Payment request started for: ${data.amount}${data.currency}`);
    const pm = await stripeService.createPaymentMethod(data);
    const payment = await stripeService.makePaymentWithMethod(pm, data);
    const confirmPayment = await stripeService.confirmPayment(payment);
    const cpRes = JSON.parse(confirmPayment.clientData);
    if (cpRes.error) return utils.responseObject(400, '', cpRes.error.code);
    const mail = await mailgunService.sendEmail(
      mailgunService.template.paymentConfirmed,
    );
    console.log(mail);
    return utils.responseObject(200, '', confirmPayment);
  } catch (e) {
    console.trace(e);
    return utils.responseObject(400, '', 'Payment failed');
  }
};

module.exports = stripeService;
