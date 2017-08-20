const nodegit = require('nodegit');
const path = require('path');

function testServer(req, res){
  res.send('Hello World');
}

function getProblem(req, res){
  const file = path.join(__dirname, '..', 'questions');
  const resJson = {};
  console.log('looking at:');
  console.log(file);
  nodegit.Repository.open(file)
    .then(repo => repo.getBranchCommit('master'))
    .then((commit) => {
      console.log('got file');
      return commit.getEntry('jeopardy.json');
    })
    .then(entry => entry.getBlob())
    .then((blob) => {
      resJson.questions = JSON.parse(blob.toString()).problems;
      res.json({
        text: resJson.questions[0].question,
      });
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    })
}

module.exports = {
  getProblem,
  testServer,
}