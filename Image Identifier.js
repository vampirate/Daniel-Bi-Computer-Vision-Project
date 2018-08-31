//Initialize all the modules and variables
var request = require('request');
var bodyParser = require('body-parser');
var events = require('events');
var bodyHTML = new events.EventEmitter();
var bodyResponse = new events.EventEmitter();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});
var JsonURL = "temp"

//Get the url from Azure Image Identifier.html

//Allow the use of Cross Origin Resource Sharing
app.use(express.static('public'));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//If the method is post
app.post('/geturl', urlencodedParser, function (req, res) {
  //Put the response into "response"
  response = {
    "url": req.body.JsonURL
  }
  console.log(response);
  //using an eventemitter to pass on the response to jsonurl variable
  bodyHTML.data = response;
  bodyHTML.emit('update');

  //using another eventemitter to get the response from azure to display back to Azure Image Identifier.html
  bodyResponse.on('update', function () {
    var string = bodyResponse.data
    res.write(JSON.stringify(string));
    res.flushHeaders();
  })
})

app.listen(3000, function () {
  console.log('listening')
});


bodyHTML.on('update', function () {
  //updating the image url
  JsonURL = bodyHTML.data;
  console.log(JsonURL);
  //making the request to azure computer vision
  request({
    url: "https://prod-18.australiaeast.logic.azure.com:443/workflows/18c4993cd07a4951bd12f96317183f91/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Q4LMKgylWjTRUeF8oQbh94ibtctOyfy-af5r5Q_Faz0",
    method: "post",
    json: true,
    headers: {
      'Ocp-Apim-Subscription-Key': 'c07929b7faf4475aa2889715230e2ee3'
    },
    body: JsonURL,
  }, function (error, response, body) {
    //passing the image description from azure back to html using another event emitter
    bodyResponse.data = body;
    bodyResponse.emit('update');
    console.log(body)
  });
});