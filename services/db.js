'use strict';

const fs = require('fs');

const WRITE_TO_FILE_INTERVAL_SECONDS = 60;

let triviaMessages, scoreboard;

function load() {
  try {
    triviaMessages = require('../data/triviaMessages.json');
  } catch (err) {
    triviaMessages = {};
  }

  if (!triviaMessages) triviaMessages = {};

  try {
    scoreboard = require('../data/scoreboard.json');
  } catch (err) {
    scoreboard = {};
  }
}

function writeToFile() {
  fs.writeFile('./data/triviaMessages.json', JSON.stringify(triviaMessages), err => {
    if (err) throw err;

    //console.log('Wrote ./data/triviaMessages.json');
  });

  fs.writeFile('./data/scoreboard.json', JSON.stringify(scoreboard), err => {
    if (err) throw err;

    //console.log('Wrote ./data/scoreboard.json');
  });
}

function getScoreboard() {
  const scoreArray = [];

  for (let key in scoreboard) scoreArray.push(scoreboard[key]);

  scoreArray.sort((a, b) => b.score - a.score);

  return scoreArray;
}

function hasAnsweredTriviaMessage(userId, triviaMessageId) {
  const triviaMessage = getTriviaMessage(triviaMessageId);

  for (let i = 0; i < triviaMessage.answers.length; i++) {
    if (triviaMessage.answers[i].id === userId) return true;
  }

  return false;
}

function getTriviaMessage(id) {
  return triviaMessages[id];
}

function addTriviaMessage(chatId, messageId, html, keyboard, correctAnswer) {
  triviaMessages[messageId] = {
    chatId,
    html,
    keyboard,
    correctAnswer,
    answers: []
  };

  //console.log('Added trivia message to db', triviaMessages[messageId]);

  writeToFile();
}

function addTriviaMessageAnswer(id, answerer, isAnswerCorrect) {
  if (hasAnsweredTriviaMessage(answerer.id, id)) return false;

  triviaMessages[id].answers.push({
    ...answerer,
    correct: isAnswerCorrect
  });

  if (!scoreboard[answerer.id]) {
    scoreboard[answerer.id] = {
      name: answerer.name,
      score: 0
    };
  }

  if (scoreboard[answerer.id].name !== answerer.name) {
    scoreboard[answerer.id].name = answerer.name;
  }

  if (isAnswerCorrect) scoreboard[answerer.id].score++;

  writeToFile();

  return true;
}

setInterval(writeToFile, WRITE_TO_FILE_INTERVAL_SECONDS * 1000);

module.exports = {
  load,
  addTriviaMessage,
  getTriviaMessage,
  addTriviaMessageAnswer,
  getScoreboard
};

