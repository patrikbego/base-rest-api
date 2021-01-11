const dataService = require('./dataService');
const utils = require('../utils');

const orderService = {
  async getOrders(createdAfterNrOfDays) {
    const result = await dataService.readAll(dataService.dirs.ordersDir);
    const orderList = result.clientData;
    const betweenList = [];
    if (createdAfterNrOfDays) {
      for (let i = 0; i < orderList.length; i += 1) {
        const order = orderList[i];
        if (order.createdAt > Date.now()
            - (1000 * 60 * 60 * 24 * createdAfterNrOfDays)) {
          betweenList.push(order);
        }
      }
    }
    return utils.responseObject(200, '',
      createdAfterNrOfDays ? betweenList : orderList);
  },
  convertDataToOrderObject(orderData) {
    return orderData;
  },
  async createOrder(orderData) {
    console.log('Creating order');
    if (orderData) {
      const orderDataObject = orderData;
      orderDataObject.status = 'RECEIVED';
      orderDataObject.createdAt = Date.now();
      orderDataObject.updatedAt = Date.now();
      orderDataObject.id = utils.uuidv4();
      try {
        console.log(`Creating order for: ${orderDataObject.receipt_email}`);
        return await dataService.create(dataService.dirs.ordersDir,
          orderDataObject.id, orderDataObject);
      } catch (err) {
        console.log(`File creation failed: ${err}`);
      }
    }
    return utils.responseObject(400, '', 'cu: User creation failed. cu');
  },
  async updateOrder(orderData, status, paymentId) {
    console.log('Creating order');
    if (orderData) {
      const orderDataObject = orderData;
      orderDataObject.status = status;
      orderDataObject.updatedAt = Date.now();
      orderDataObject.paymentId = paymentId.code && paymentId.code === 200
        ? (JSON.parse(paymentId.clientData)).id : '';
      try {
        console.log(`Creating order for: ${orderDataObject.receipt_email}`);
        return await dataService.update(dataService.dirs.ordersDir,
          orderDataObject.id, orderDataObject);
      } catch (err) {
        console.log(`File creation failed: ${err}`);
      }
    }
    return utils.responseObject(400, '', 'cu: User creation failed. cu');
  },
  async getOrdersByPaymentId(paymentId) {
    const result = await dataService.readAll(dataService.dirs.ordersDir);
    const orderList = result.clientData;
    for (let i = 0; i < orderList.length; i += 1) {
      const order = orderList[i];
      if (order.paymentId === paymentId) {
        return utils.responseObject(200, '', order);
      }
    }
    return utils.responseObject(200, '', 'Order does not exist');
  },
};

module.exports = orderService;
