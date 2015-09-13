//
var 
    express = require('express'),
    gcm = require('node-gcm'),
    apn = require('apn'),
    bodyParser = require('body-parser'),
    Firebase = require('firebase'),
    app = express(),
    ref = new Firebase('https://incandescent-torch-5679.firebaseio.com/push_notifications'),
    device_token;
/*
, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log(port, host);
}
*/
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/register', function(req, res){
    device_token = req.body.device_token;
    userID = req.body.userID;
    device_type = req.body.deviceType;
    ref.push({ 'userID':userID, 'deviceToken': device_token, 'deviceType': device_type});
    console.log(device_token);
    //add token to database
    res.send('ok');
});

app.get('/push', function(req, res){
    ref.orderByChild('userID').equalTo(req.query.userID).on("child_added", function(snapshot) {
        var val = snapshot.val();

        if(val.deviceType === 'android'){
            var 
                device_tokens = [], //create array for storing device tokens
                retry_times = 4, //the number of times to retry sending the message if it failed
                sender = new gcm.Sender('AIzaSyDpA0b2smrKyDUSaP0Cmz9hz4cQ19Rxn7U'), //create a new sender
                message = new gcm.Message(); //create a new message

                message.addData('title', 'Open Circles');
                message.addData('message', req.query.message);
                message.addData('sound', 'notification');

                message.collapseKey = 'testing'; //grouping messages
                message.delayWhileIdle = true; //delay sending while receiving device is offline
                message.timeToLive = 3; //the number of seconds to keep the message on the server if the device is offline

                device_tokens.push(val.deviceToken);

                sender.send(message, device_tokens, retry_times, function(result){
                    console.log(result);
                    console.log('push sent to: ' + device_token);
                });
        }else if(val.deviceType === 'ios'){
            var 
                options = { },
                apnConnection = new apn.Connection(options),
                device = new apn.Device(val.deviceToken),
                note = new apn.Notification();

                note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                note.badge = 3;
                note.sound = "ping.aiff";
                note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
                note.payload = {'message': req.query.message};

                apnConnection.pushNotification(note, device);
        }
    });

    res.send('ok');
});

app.listen(8000);