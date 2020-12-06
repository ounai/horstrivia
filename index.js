'use strict';

const botService = require('./services/bot');
const dbService = require('./services/db');

dbService.load();

botService().then(data => {
  console.log('Bot up and running!');
  console.log(data);
}).catch(err => {
  throw err;
});

