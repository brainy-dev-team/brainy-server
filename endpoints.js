const path = require('path');
const fs = require('fs');
const moment = require('moment');
const request = require('request');
// require('es6-promise').polyfill();
// // require('isomorphic-fetch');

let score = {
  solvers: [],
};

const defaults = {
  duration: 8,
  type: 'brain-teasers',
}

function testServer(req, res){
  res.send('Hello World');
}

function getProblem(req, res){
  const file = path.join(__dirname, 'jeopardy.json');
  console.log(file);
  const resJson = {};
  fs.readFile(file, 'utf8', (err, data) => {
    if(err){
      res.send(err);
    }
    console.log(data);
    const jsonData = JSON.parse(data).problems;
    const random = Math.floor(Math.random() * jsonData.length);
    const selected = jsonData[random];
    score.answer = selected.answer;
    resJson.text = `*${selected.title}*\n${selected.question}`;
    res.json(resJson);
  });
}

function setupBrainy(req, res){
  const inputs = req.body.text.split(' ');
  const type = inputs[0];
  const duration = inputs[1];
  const unit = inputs[2]
  const pairedMode = inputs[3];
  const file = path.join(__dirname, `${type}.json`);

  score.startDate = moment();
  score.endDate = moment().add(Number(duration), unit);
  score.duration = moment.duration(Number(duration), unit).asMilliseconds();
  console.log(file);
  console.log('setup is:');
  console.log(score);
  const resJson = {};
  fs.readFile(file, 'utf8', (err, data) => {
    if(err){
      res.send(err);
    }
    console.log(data);
    const jsonData = JSON.parse(data).problems;
    const random = Math.floor(Math.random() * jsonData.length);
    const selected = jsonData[random];
    console.log('selected is:');
    console.log(selected);
    score.answer = selected.answer;
    resJson.text = `<#general> New Brainy Starting Now!\nHere is the question:\n*${selected.title}*\n${selected.question}`;
    sendBrainy(resJson);
    setTimeout(function(){ 
      timeUp();
    }, score.duration);
    res.json({
      text: 'Brainy will be send shortly!'
    });
  });
}

function sendBrainy(brainyObj){
  request.post({
    method: 'POST',
    uri: 'https://hooks.slack.com/services/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',
    headers: [
      {
        name: 'content-type',
        value: 'application/json'
      }
    ],
    body: JSON.stringify(brainyObj)
  }, function(error, response, body){
    console.log('done');
  });
}

function pairUsers(){

}

function timeUp(){
  request.post({
    method: 'POST',
    uri: 'https://hooks.slack.com/services/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',
    headers: [
      {
        name: 'content-type',
        value: 'application/json'
      }
    ],
    body: JSON.stringify({
      text: 'Times up!' 
    })
  }, function(error, response, body){
    if(error){
      console.log(error);
    }
    const isSolved = score.solvers.length != 0 ? true : false;
    const msg = isSolved ? 'Here are the solvers:' : 'There were no solvers... :(';
    request.post({
      method: 'POST',
      uri: 'https://hooks.slack.com/services/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',
      headers: [
        {
          name: 'content-type',
          value: 'application/json'
        }
      ],
      body: JSON.stringify({
        text: msg,
      })
    }, function(error, response, body){
      console.log('done');
      let solversMsg = '';
      for(let i = 0; i < score.solvers.length; i++){
        solversMsg += `<@${score.solvers[i].username}> solved it on ${score.solvers[i].time}\n`;
      }
      request.post({
        method: 'POST',
        uri: 'https://hooks.slack.com/services/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',
        headers: [
          {
            name: 'content-type',
            value: 'application/json'
          }
        ],
        body: JSON.stringify({
          text: solversMsg,
        })
      }, function(error, response, body){
        console.log('done');
        score = {
          solvers: [],
        }
      });
    });
  });
}

function validateAnswer(req, res){
  console.log('validating');
  console.log(req.body);
  console.log('submitted answer');
  console.log(req.body.text);
  console.log(score);
  if(score.answer === req.body.text.toLowerCase().trim()){
    score.solvers.push({
      username: req.body.user_name,
      time: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
    });
    res.json({
      text: `Yay! You got it! Look to see who else got it at ${score.endDate}!`
    })
  } else {
    res.json({
      text: 'Oh... not what we were looking for! Keep trying though! Feel free to ask your colleagues for hints!'
    })
  }
}

module.exports = {
  getProblem,
  testServer,
  validateAnswer,
  setupBrainy,
}