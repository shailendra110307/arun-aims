var express = require('express');
var path = require('path');
var app = express();
var port = process.env.PORT || 3001;

app.use('/', express.static(path.join(__dirname, 'dist')));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/dist/index.html');
});

app.listen(port, function () {
  console.log('Example app listening on port!' + port)
});