const path = require('path');
const fs = require('fs');

const score = {};

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
    resJson.text = `*${selected.title}*\n${selected.question}`;
    res.json(resJson);
  });
}

function validateAnswer(req, res){
  console.log('validating');
  console.log(req.body);
  res.send('validate');
}

module.exports = {
  getProblem,
  testServer,
  validateAnswer
}