const express = require('express');
const app = express();
const { testServer, getProblem } = require('./endpoints');

app.get('/', testServer);

app.post('/', testServer);

app.post('/getQuestion', getProblem)

app.listen(3000, function(){
  console.log('Example app listening on post 3000!');
});