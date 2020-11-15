'use strict';

const bot = require('./services/bot');

bot().then(data => {
  console.log('Bot up and running!');
  console.log(data);
}).catch(err => {
  throw err;
});

