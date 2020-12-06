'use strict';

const axios = require('axios');
const he = require('he');

const translateService = require('./translate.js');

const API_URL = 'https://opentdb.com/api.php';

async function requestQuestions(amount, { category, difficulty, type } = {}) {
  const res = await axios.get(API_URL, {
    params: {
      amount,
      category,
      difficulty,
      type
    }
  });

  return res.data.results[0];
}

function getQuestion() {
  return requestQuestions(1);
}

async function translateQuestion(encodedQuestion) {
  const question = he.decode(encodedQuestion.question);
  const answers = [ he.decode(encodedQuestion.correct_answer) ];

  encodedQuestion.incorrect_answers.forEach(answer => answers.push(he.decode(answer)));

  console.log('Translating', [question, ...answers]);

  const arr = await translateService.translateArray([question, ...answers]);

  const translatedQuestion = {
    ...encodedQuestion,
    question: arr[0],
    correct_answer: arr[1],
    incorrect_answers: arr.splice(2)
  };

  return translatedQuestion;
}

module.exports = {
  getQuestion,
  translateQuestion
};

