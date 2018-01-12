var request = require('request');
var bodyParser = require('body-parser');
var express = require('express');
var microsofComputerVision = require("microsoft-computer-vision");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
/**var params = {
           "visualFeatures": "Categories,Description,Color",
           "details": "",
           "language": "en",
       };
       */
let FACEBOOK_VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;
let FACEBOOK_PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
let MS_SUBS_KEY = process.env.MS_SUBS_KEY;
let FACEBOOK_SEND_MESSAGE_URL = 'https://graph.facebook.com/v2.6/me/messages?access_token=' + FACEBOOK_PAGE_ACCESS_TOKEN;
//let BASE_URL = 'https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Description,Tags&subscription-key='+MS_SUBS_KEY;


//your routes here
app.get('/', function (req, res) {
    res.send("Hello World, I am a bot.")
});

app.get('/webhook/', function(req, res) {
  if (req.query['hub.verify_token'] === FACEBOOK_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge'])
        return;
    }
    res.send('Error, wrong token')
});

app.post('/webhook/', function(req, res) {
  if (req.body.object === 'page') {
    if (req.body.entry) {
      req.body.entry.forEach(function(entry) {
        if (entry.messaging) {
          entry.messaging.forEach(function(messagingObject) {
              var senderId = messagingObject.sender.id;
              if (messagingObject.message) {
                if (!messagingObject.message.is_echo) {
                  //Assuming that everything sent to this bot is a movie name.
                  //YHAA MERA TEXT REPLY KA FUNCTION AAEGA
                  handleMessage(senderId,messagingObject.message)
                }
              } else if (messagingObject.postback) {
                console.log('Received Postback message from ' + senderId);
              }
          });
        } else {
          console.log('Error: No messaging key found');
        }
      });
    } else {
      console.log('Error: No entry key found');
    }
  } else {
    console.log('Error: Not a page object');
  }
  res.sendStatus(200);
})


function showTypingIndicatorToUser(senderId, isTyping) {
  var senderAction = isTyping ? 'typing_on' : 'typing_off';
  request({
    url: FACEBOOK_SEND_MESSAGE_URL,
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      sender_action: senderAction
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending typing indicator to user: ' + error);
    } else if (response.body.error){
      console.log('Error sending typing indicator to user: ' + response.body.error);
    }
  });
}


/////////
function handleMessage(senderId,received_message){
  let response;
  if(received_message.text){
    response={
      "text":`Hi! I respect your message but currently I support only images`
    }
    callSendAPI(senderId,response);
  }else if (received_message.attachments){
   let attachment_url = received_message.attachments[0].payload.url;
  //vartmp= result; tmp="me";
  microsofComputerVision.analyzeImage({
      "Ocp-Apim-Subscription-Key": MS_SUBS_KEY,
      "request-origin":"westcentralus",
      "content-type": "application/json",
      "url": attachment_url,
      "visual-features":"Categories,Tags,Description,Faces,ImageType,Color,Adult"
        }).then((result) => {
          let temp = describesImage(result);
          //result =JSON.stringify(result.description.captions);
          response={
            "text":temp // Can be at least one or more, separated by comma
          }
          callSendAPI(senderId,response);
    });

   //var json=getImageDetails(attachment_url);

  }
//  callSendAPI(senderId,response);
}

function describesImage(result){
  if(Object.keys(result.categories[0].detail.celebrities).length>0){
    //let cat = JSON.stringify(result.categories[0].detail.celebrities[0].name);
    //let cat = JSON.stringify(result.description.captions);
    //return cat;
    Object.keys(result.categories[0].detail.celebrities).forEach(function(element){
      let cat = JSON.stringify(element.name);
      return cat;
    });
  }
  return `no`;
}

function callSendAPI(senderId,response){
  let request_body={
    "recipient":{
      "id":senderId
    },
    "message": response
  }
  request({
    url: FACEBOOK_SEND_MESSAGE_URL,
    method: 'POST',
    json: request_body
  }, function(error, response, body) {
        if (error) {
          console.log('Error sending message to user: ' + error);
        } else if (response.body.error){
          console.log('Error sending message to user: ' + response.body.error);
        }
  });
}
/*
function getImageDetails(url){
  microsofComputerVision.analyzeImage({
    "Ocp-Apim-Subscription-Key": MS_SUBS_KEY,
    "request-origin":"westcentralus",
    "content-type": "application/json",
    "url": "https://goo.gl/Hpz7gi",
    "visual-features":"Tags, Faces"
      }).then((result) => {
      return result;
  });
}

*/
app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
