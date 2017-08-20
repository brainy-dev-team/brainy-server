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
  if(score.question){
    res.json({
      text: 'Oh? There is another brainy in session already!',
      attachments: [{
        fallback: 'Whoops!',
        image_url: 'https://github.com/brainy-dev-team/brainy_hack_icons/blob/master/brain_merp.png?raw=true'
      }]
    });
  } else {
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
    if(pairedMode){
      pairUsers()
    }
    fs.readFile(file, 'utf8', (err, data) => {
      if(err){
        res.json({
          text: 'Are you sure you spelt the question type correctly?',
          attachments: [{
            fallback: 'Whoops!',
            image_url: 'https://github.com/brainy-dev-team/brainy_hack_icons/blob/master/brain_merp.png?raw=true'
          }]
        });
      }
      console.log(data);
      const jsonData = JSON.parse(data).problems;
      const random = Math.floor(Math.random() * jsonData.length);
      const selected = jsonData[random];
      console.log('selected is:');
      console.log(selected);
      score.question = selected.question;
      score.answer = selected.answer;
      resJson.text = `<#general> New Brainy Starting Now!\nHere is the question:\n*${selected.title}*\n${selected.question}`;
      sendBrainy(resJson, pairedMode);
      setTimeout(function(){ 
        timeUp();
      }, score.duration);
      res.json({
        text: 'Brainy will be send shortly!'
      });
    });
  }
}

function sendBrainy(brainyObj, pairedMode){
  if(pairedMode){
    brainyObj.attachments = [{
      fallback: 'Question!',
      image_url: 'https://github.com/brainy-dev-team/brainy_hack_icons/blob/master/brain_pair.png?raw=true'
    }]
  } else {
    brainyObj.attachments = [{
      fallback: 'Question!',
      image_url: 'https://github.com/brainy-dev-team/brainy_hack_icons/blob/master/brain_solve.png?raw=true'
    }]
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
    body: JSON.stringify(brainyObj)
  }, function(error, response, body){
    console.log('done');
  });
}

function pairUsers(){
  request.get({
    method: 'GET',
    uri: 'https://slack.com/api/channels.list?token=xoxp-229867051814-228975318018-228518942560-f7a15369142cbb0ae92884e53c94f4b7&pretty=1',
  }, function(error, response, body){
    if(error){
      console.log(error);
    }
    console.log(body);
    const body1 = JSON.parse(body);
    let members;
    let selectedChannel;
    for(let i = 0; i < body1.channels.length; i += 1){
      if(body1.channels[i].name === 'general'){
        selectedChannel = body1.channels[i];
        members = selectedChannel.members;
        console.log('selected channel');
        console.log(selectedChannel);
        console.log(members)
        break;
      }
    }
    const memberNames = [];
    request.get({
    method: 'GET',
      uri: 'https://slack.com/api/users.list?token=xoxp-229867051814-228975318018-228518942560-f7a15369142cbb0ae92884e53c94f4b7&pretty=1',
    }, function(error, response, body){
      if(error){
        console.log(error);
      }
      console.log(body);
      const body2 = JSON.parse(body);
      for(let j = 0; j < body2.members.length; j += 1){
        if(members.indexOf(body2.members[j].id) !== -1){
          memberNames.push(body2.members[j].name);
        }
      }
      console.log('membernames');
      console.log(memberNames);
      shuffle(memberNames);
      console.log('group');
      console.log(memberNames);
      let msgGroups = '';
      for(let i = 0; i < memberNames.length; i += 1){
        if(i % 2 === 0){
          msgGroups += `Here is a group:\n<@${memberNames[i]}> and `;
        } else {
          msgGroups += `<@${memberNames[i]}>\n`;
        }
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
          text: `*Paired mode!*\nHere are the groups:\n${msgGroups}`
        })
      }, function(error, response, body){
        console.log('done');
      })
    });
  });
}

function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
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
    const image = isSolved ? [{
        fallback: 'Yay!',
        image_url: 'https://github.com/brainy-dev-team/brainy_hack_icons/blob/master/brain_yay.png?raw=true'
      }] :
      [{
        fallback: 'Whoops!',
        image_url: 'https://github.com/brainy-dev-team/brainy_hack_icons/blob/master/brain_merp.png?raw=true'
      }];
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
        attachments: image,
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
  console.log('submitted answer:');
  console.log(req.body.text);
  console.log('submitted validated answer:');
  console.log(req.body.text.toLowerCase());
  console.log(score);
  console.log('the right answer is:');
  console.log(score.answer);
  if(score.answer.toLowerCase() == req.body.text.toLowerCase().trim()){
    score.solvers.push({
      username: req.body.user_name,
      time: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
    });
    res.json({
      text: `Yay! You got it! Look to see who else got it at ${score.endDate}!`,
      attachments: [{
        fallback: 'Good work!',
        image_url: 'https://github.com/brainy-dev-team/brainy_hack_icons/blob/master/brain_yay.png?raw=true'
      }]
    });
  } else if( !score.question ){
    res.json({
      text: 'Whoops! Looks like we don\'t have a question yet... wait until one gets set up!',
      attachments: [{
        fallback: 'Whoops!',
        image_url: 'https://github.com/brainy-dev-team/brainy_hack_icons/blob/master/brain_merp.png?raw=true'
      }]
    });
  } else {
    res.json({
      text: 'Oh... not what we were looking for! Keep trying though! Feel free to ask your colleagues for hints!',
      attachments: [{
        fallback: 'Whoops!',
        image_url: 'https://github.com/brainy-dev-team/brainy_hack_icons/blob/master/brain_merp.png?raw=true'
      }]
    });
  }
}

function resetService(req, res){
  score = [];
  res.send('Service reset!');
}

module.exports = {
  getProblem,
  testServer,
  validateAnswer,
  setupBrainy,
  resetService,
}