'use strict';

const translateConfig = require('../config/translate.json');

function translateText(text) {
  return new Promise((resolve, reject) => {
    resolve(text
        .split(translateConfig.SEPARATOR)
        .map(str => '(translated)' + str)
        .join(translateConfig.SEPARATOR));
  });
}

function translateArray(arr) {
  return new Promise((resolve, reject) => {
    translateText(arr.join(translateConfig.SEPARATOR))
      .then(text => resolve(text.split(translateConfig.SEPARATOR)))
      .catch(err => reject(err));
  });
}

module.exports = {
  translateText,
  translateArray
};

