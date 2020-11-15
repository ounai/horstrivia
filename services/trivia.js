'use strict';

const axios = require('axios');
const he = require('he');

const translateService = require('./translate.js');

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

function translateQuestion(encodedQuestion) {
  return new Promise((resolve, reject) => {
    const question = he.decode(encodedQuestion.question);

    const answers = [ he.decode(encodedQuestion.correct_answer) ];
    encodedQuestion.incorrect_answers.forEach(answer => answers.push(he.decode(answer)));

    translateService.translateArray([question, ...answers])
      .then(data => {
        const translatedQuestion = {
          ...encodedQuestion,
          question: data[0],
          correct_answer: data[1],
          incorrect_answers: data.splice(2)
        };

        resolve(translatedQuestion);
      })
      .catch(reject);
  });
}

module.exports = {
  getQuestion,
  translateQuestion
};

