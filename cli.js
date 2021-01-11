const readline = require('readline');
const events = require('events');
const cliService = require('./src/service/cliService');

class _events extends events {}

const e = new _events();

const cli = {
  processInput(str, args) {
    const strInput = typeof (str) === 'string' && str.trim().length > 0
      ? str.trim()
      : '';
    switch (strInput.toLowerCase()) {
      case 'stats':
        e.emit('event', args, cliService.stats);
        return true;
      case 'exit':
        e.emit('event', args, cliService.exit);
        return true;
      case 'man':
      case 'help':
        e.emit('event', args, cliService.man);
        return true;
      case 'val':
        e.emit('event', args, cliService.val);
        return true;
      case 'vru':
        e.emit('event', args, cliService.vru);
        return true;
      case 'vao':
        e.emit('event', args, cliService.vao);
        return true;
      default:
        e.emit('event', args, cliService.na);
        return true;
    }
  },
};

e.on('event', (args, func) => {
  func(args);
});

cli.init = function () {
  console.log('\x1b[34m%s\x1b[0m', 'CLI has started');

  const exec = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '',
  });

  exec.prompt();

  exec.on('line', (str) => {
    if (str.indexOf('-') > -1) {
      const arr = str.split('--');
      cli.processInput(arr[0], arr[1]);
    } else {
      cli.processInput(str);
    }
    exec.prompt();
  });

  exec.on('close', () => {
    process.exit(0);
  });
};

module.exports = cli;
