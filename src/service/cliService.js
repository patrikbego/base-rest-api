const os = require('os');
const v8 = require('v8');
const itemsService = require('./itemsService');
const userService = require('./userService');
const ordersService = require('./orderService');

const cliService = {
  man() {
    const commands = {
      exit: 'Kill the CLI (and the rest of the application)',
      man: 'Show this help page',
      help: 'Alias of the "man" command',
      stats: 'Get statistics on the underlying operating system and resource utilization',
      val: 'Show a list of all the items available',
      vao: 'View all the recent orders in the system (orders placed in the last xxx days).\nE.g. vao --days=1'
          + '\nOr lookup the details of a specific order by order ID.\nE.g. vru --id=123',
      vru: 'View all the users who have signed up in the last xxx days.\nE.g. vru --days=1'
          + '\nOr lookup the details of a specific user by email address.\nE.g. vru --email=test@test.com',
    };

    // Show a header for the help page that is as wide as the screen
    cliService.header('CLI MANUAL');

    // Show each command, followed by its explanation, in white and yellow respectively
    for (const key in commands) {
      if (commands.hasOwnProperty(key)) {
        const value = commands[key];
        let line = `      \x1b[33m ${key}      \x1b[0m`;
        const padding = 60 - line.length;
        for (let i = 0; i < padding; i += 1) {
          line += ' ';
        }
        line += value;
        console.log(line);
        cliService.verticalSpace();
      }
    }
    cliService.verticalSpace(1);

    // End with another horizontal line
    cliService.horizontalLine();
  },
  na() {
    console.log('This command does not exist. Please run \'man\' or \'help\'');
  },
  exit() {
    console.log('Exiting the CLI');
    process.exit(0);
  },
  horizontalLine() {
    const width = process.stdout.columns;
    let line = '';
    for (let i = 0; i < width; i += 1) {
      line += '-';
    }
    console.log(line);
  },
  stats() {
    const stats = {
      load_average: os.loadavg(),
      cpu_count: os.cpus().length,
      free_mem: os.freemem(),
      current_malloced_mem: v8.getHeapStatistics().malloced_memory,
      peak_malloced_memory: v8.getHeapStatistics().peak_malloced_memory,
      avail_heap_used_perc: Math.round((v8.getHeapStatistics().used_heap_size
          / v8.getHeapStatistics().total_heap_size) * 100),
      avail_heap_allocated_perc: Math.round(
        (v8.getHeapStatistics().total_heap_size
              / v8.getHeapStatistics().heap_size_limit) * 100,
      ),
      uptime: `${os.uptime()} Seconds`,
    };
    cliService.header('SYSTEM STATISTICS');

    // Log out each stat
    for (const key in stats) {
      debugger;
      if (Object.prototype.hasOwnProperty.call(stats, key)) {
        const value = stats[key];
        let line = `      \x1b[33m ${key}      \x1b[0m`;
        const padding = 60 - line.length;
        for (let i = 0; i < padding; i += 1) {
          line += ' ';
        }
        line += value;
        console.log(line);
        cliService.verticalSpace();
      }
    }

    // Create a footer for the stats
    cliService.verticalSpace();
    cliService.horizontalLine();
  },
  verticalSpace(lines) {
    const linesInput = typeof lines === 'number' && lines > 0 ? lines : 1;
    for (let i = 0; i < linesInput; i += 1) {
      console.log('');
    }
  },
  centered(str) {
    const inputStr = typeof str === 'string' && str.trim().length > 0
      ? str.trim()
      : false;
    if (inputStr) {
      const width = process.stdout.columns;
      let line = '';
      for (let i = 0; i < width / 2; i += 1) {
        line += ' ';
      }
      line += inputStr;
      console.log(line);
    }
  },
  header(title) {
    cliService.horizontalLine();
    cliService.centered(title);
    cliService.horizontalLine();
    cliService.verticalSpace(2);
  },
  async val() {
    const items = await itemsService.getItems();
    cliService.header('ITEMS');
    console.log(items.clientData);
  },
  async vru(searchAttribute) {
    let users;
    if (!searchAttribute) {
      users = await userService.getAllUsers();
    } else if (searchAttribute.indexOf('days') !== -1) {
      const attr = searchAttribute.split('=');
      users = await userService.getAllUsers(attr[1]);
    } else if (searchAttribute.indexOf('email') !== -1) {
      const attr = searchAttribute.split('=');
      users = await userService.getByEmail(attr[1]);
    }
    cliService.header('RECENT USERS');
    console.log(users ? users.clientData : '');
  },
  async vao(searchAttribute) {
    let orders;
    if (!searchAttribute) {
      orders = await ordersService.getOrders();
    } else if (searchAttribute.indexOf('days') !== -1) {
      const attr = searchAttribute.split('=');
      orders = await ordersService.getOrders(attr[1]);
    } else if (searchAttribute.indexOf('id') !== -1) {
      const attr = searchAttribute.split('=');
      orders = await ordersService.getOrdersByPaymentId(attr[1]);
    }
    cliService.header('RECENT ORDERS');
    console.log(orders ? orders.clientData : '');
  },
};

module.exports = cliService;
