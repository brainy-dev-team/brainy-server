const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const { testServer, getProblem, validateAnswer, setupBrainy, resetService } = require('./endpoints');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', testServer);

app.post('/', testServer);

app.post('/getQuestion', getProblem);

app.post('/answer', validateAnswer);

app.post('/setup', setupBrainy);

app.post('/reset', resetService);

app.listen(3000, function(){
  console.log('Example app listening on post 3000!');
});