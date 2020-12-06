'use strict';

const axios = require('axios');

const translateConfig = require('../config/translate.json');

const DEBUG = false;

function translateText(text) {
  return new Promise((resolve, reject) => {
    //console.log(text);

    if (DEBUG) {
      resolve(text
        .split(translateConfig.SEPARATOR)
        .map(str => '(translated)' + str)
        .join(translateConfig.SEPARATOR));
    } else {
      axios.post(translateConfig.TRANSLATE_API_URL, {
        text
      }).then(response => {
        resolve(response.data);
      }).catch(reject);
    }
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

