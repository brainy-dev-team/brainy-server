const express = require('express');
const app = express();
const { getProblem } = require('./endpoints');

app.get('/', getProblem);

app.post('/', getproblem);

app.listen(3000, function(){
  console.log('Example app listening on post 3000!');
});