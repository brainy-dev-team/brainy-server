const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const { testServer, getProblem, validateAnswer } = require('./endpoints');

app.use(bodyParser.json());

app.get('/', testServer);

app.post('/', testServer);

app.post('/getQuestion', getProblem);

app.post('/answer', validateAnswer);

app.listen(3000, function(){
  console.log('Example app listening on post 3000!');
});