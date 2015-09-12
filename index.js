//
var express = require('express');
var gcm = require('node-gcm');
var apn = require('apn');

var app = express();
var device_token;

/*
, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log(port, host);
}
*/

app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/register', function(req, res){
    device_token = req.body.device_token;
    console.log(device_token);
    //add token to database
    res.send('ok');
});

app.get('/push', function(req, res){

    var device_tokens = []; //create array for storing device tokens
    var retry_times = 4; //the number of times to retry sending the message if it fails

    var sender = new gcm.Sender('AIzaSyDpA0b2smrKyDUSaP0Cmz9hz4cQ19Rxn7U'); //create a new sender
    var message = new gcm.Message(); //create a new message

    message.addData('title', 'Open Circles');
    message.addData('message', req.query.message);
    message.addData('sound', 'notification');

    message.collapseKey = 'testing'; //grouping messages
    message.delayWhileIdle = true; //delay sending while receiving device is offline
    message.timeToLive = 3; //the number of seconds to keep the message on the server if the device is offline

    device_tokens.push(device_token);

    sender.send(message, device_tokens, retry_times, function(result){
        console.log(result);
        console.log('push sent to: ' + device_token);
    });

    res.send('ok');
});

app.listen(8000);