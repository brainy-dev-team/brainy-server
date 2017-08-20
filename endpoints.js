const nodegit = require('nodegit');
const path = require('path');

function testServer(req, res){
  res.send('Hello World');
}

function getProblem(req, res){
  const file = path.join(__dirname, '..', 'questions');
  const resJson = {};

  nodegit.Repository.open(file)
    .then(repo => repo.getBranchCommit('master'))
    .then((commit) => {
      return commit.getEntry('jeopardy.json');
    })
    .then(entry => entry.getBlob())
    .then((blob) => {
      resJson.questions = JSON.parse(blob.toString()).problems;
      res.json({
        text: resJson.questions[0].question,
      });
    })
}

module.exports = {
  getProblem,
  testServer,
}