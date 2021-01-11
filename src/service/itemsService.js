const dataService = require('./dataService');
const utils = require('../utils');

const itemsService = {
  async getItems() {
    return await dataService.read(dataService.dirs.itemsDir, 'itemsList');
  },
};

itemsService.addItem = async function (item) {
  const result = await dataService.read(dataService.dirs.itemsDir, 'itemsList');
  const itemsList = result.clientData;
  console.log(`itemsList${itemsList.push(item)}`);
  await dataService.update(dataService.dirs.itemsDir, 'itemsList',
    itemsList);
  return utils.responseObject(200, '', { items: itemsList });
};

itemsService.deleteItem = async function (itemToBeRemoved) {
  const result = await dataService.read(dataService.dirs.itemsDir, 'itemsList');
  const itemsList = result.clientData;
  for (let i = 0; i < itemsList.length; i++) {
    if (itemsList[i].id === itemToBeRemoved.id) {
      itemsList.splice(i, 1);
    }
  }
  await dataService.update(dataService.dirs.itemsDir, 'itemsList',
    itemsList);
  return utils.responseObject(200, '', { items: itemsList });
};

module.exports = itemsService;
