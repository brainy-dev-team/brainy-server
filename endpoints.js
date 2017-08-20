const path = require('path');
const fs = require('fs');

function testServer(req, res){
  res.send('Hello World');
}

function getProblem(req, res){
  const file = path.join(__dirname, './questions/jeopardy.json');
  console.log(file);
  const resJson = {};
  fs.readFile(file, 'utf8', (err, data) => {
    if(err){
      res.send(err);
    }
    console.log(data);
    const jsonData = JSON.parse(data).problems;
    const random = Math.floor(Math.random() * jsonData.length);
    res.json(jsonData[random]);
  });
  // const resJson = {};
  // console.log('looking at:');
  // console.log(file);
  // nodegit.Repository.open(file)
  //   .then(repo => repo.getBranchCommit('master'))
  //   .then((commit) => {
  //     console.log('got file');
  //     return commit.getEntry('jeopardy.json');
  //   })
  //   .then(entry => entry.getBlob())
  //   .then((blob) => {
  //     resJson.questions = JSON.parse(blob.toString()).problems;
  //     res.json({
  //       text: resJson.questions[0].question,
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     res.send(err);
  //   })
}

module.exports = {
  getProblem,
  testServer,
}