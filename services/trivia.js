'use strict';

const axios = require('axios');

const API_URL = 'https://opentdb.com/api.php';

function requestQuestions(amount, { category, difficulty, type } = {}) {
  return new Promise((resolve, reject) => {
    axios.get(API_URL, {
      params: {
        amount,
        category,
        difficulty,
        type
      }
    })
    .then(res => resolve(res.data.results[0]))
    .catch(reject);
  });
}

function getQuestion() {
  return requestQuestions(1);
}

module.exports = {
  getQuestion
};

