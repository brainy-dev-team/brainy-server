function getProblem(req, res){
  console.log(req);
  res.send('Hello World');
}

module.exports = {
  getProblem,
}