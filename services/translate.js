'use strict';

const axios = require('axios');

const translateConfig = require('../config/translate.json');

const DEBUG = false;

async function translateText(text) {
  if (DEBUG) {
    console.log('Translating', text);

    return text
      .split(translateConfig.SEPARATOR)
      .map(str => `(translated) ${str}`)
      .join(translateConfig.SEPARATOR);
  } else {
    const res = await axios.post(translateConfig.TRANSLATE_API_URL, { text });

    return res.data;
  }
}

async function translateArray(arr) {
  const text = await translateText(arr.join(translateConfig.SEPARATOR));

  return text.split(translateConfig.SEPARATOR);
}

module.exports = {
  translateText,
  translateArray
};

