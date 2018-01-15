# Building a Facebook Messenger Bot on Hasura

This tutorial consists of a facebook messenger bot which in response to the image sent replies with the description of it. It can identify World Celebrities,a group of Celebrities,any scene and even your own image. For your image it guesses your age (no-offence) and gender too.
You can read the [documentation](https://developers.facebook.com/docs/messenger-platform/quickstart) the Messenger team prepared

For the chat bot to function we'll need a server that will receive the messages sent by the Facebook users, process this message and respond back to the user. To send messages back to the server we will use the graph API provided by Facebook. For the Facebook servers to talk to our server, the endpoint URL of our server should be accessible to the Facebook server and should use a secure HTTPS URL. For this reason, running our server locally will not work and instead we need to host our server online. In this tutorial, we are going to deploy our server on Hasura which automatically provides SSL-enabled domains.

## Have a look
![Final screen](https://github.com/vipulrawat/fb-faceAnalysis-bot/blob/master/assets/demo_gif.gif "Final screen demo")

## Features

* Recongizes celebrities with high efficiency.
* Group of people also works well.
* Guesses age and gender of the person.

## Pre-requisites

* [NodeJS](https://nodejs.org)

* [hasura CLI](https://docs.hasura.io/0.15/manual/install-hasura-cli.html)

* [Microsoft Computer Vision](https://)

## Steps for Get-Set-Go

### Create a facebook application

* Navigate to https://developers.facebook.com/apps/
* Click on **'+ Create a new app’** or **'+ Add a new app’** (If you are already created some apps).

![Fb app screen](https://raw.githubusercontent.com/vipulrawat/fb-pincode-bot/master/assets/1.png "fb app screen")

* Give a display name for your app and a contact email.

* In the select a product screen, hover over **Messenger** and click on **Set Up**

![Fb app screen3](https://raw.githubusercontent.com/vipulrawat/fb-pincode-bot/master/assets/2.png "fb app screen")

* To start using the bot, we need a facebook page to host our bot.
  + Scroll over to the **Token Generation** section
  + Choose a page from the dropdown *(Incase you do not have a page, create one)*
  + Once you have selected a page, a *Page Access Token* will be generated for you.
  + Save this token somewhere.

![Page token](https://raw.githubusercontent.com/vipulrawat/fb-pincode-bot/master/assets/3.png "page token screen")

* Now, we need to trigger the facebook app to start sending us messages
  - Switch back to the terminal
  - Paste the following command:

```sh
# Replace <PAGE_ACCESS_TOKEN> with the page access token you just generated.
$ curl -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=<PAGE_ACCESS_TOKEN>"
```

* **In this project, we are using Microsoft Computer Vision API. To get your API key go the the below link and sign up yourself. Then go to your dashboard and use any one of the API key. To know more about the API go this link https://azure.microsoft.com/en-us/try/cognitive-services/?api=computer-vision**

### Getting the Hasura project
To get yourself started with the project simply clone this repository. Follow these simple steps:
```sh
$ hasura quickstart vipulrawat/fb-pincode-bot
$ cd fb-pincode-bot
# Add FACEBOOK_VERIFY_TOKEN to secrets. This is any pass phrase that you decide on, keep a note on what you are choosing as your verify token, we will be using it later while setting things up for your bot on the facebook developer page.
$ hasura secrets update bot.fb_verify_token.key <YOUR-VERIFY-TOKEN>
# Add FACEBOOK_PAGE_ACCESS_TOKEN to secrets
$ hasura secrets update bot.fb_page_token.key <YOUR-FB-PAGE-ACCESS-TOKEN>
# Add Movie db api token to secrets
$ hasura secrets update bot.ms_subs_key.key <YOUR-COMPUTERVISION-API-KEY>
# Deploy
$ git add . && git commit -m "Deployment commit"
$ git push hasura master
```

After the `git push` completes:

```sh
$ hasura microservice list
```

You will get an output like so:

```sh
INFO Getting microservices...                     
INFO Custom microservices:                        
NAME   STATUS    INTERNAL-URL(tcp,http)   EXTERNAL-URL
bot    Running   bot.default              https://bot.oblong44.hasura-app.io

INFO Hasura microservices:                        
NAME            STATUS    INTERNAL-URL(tcp,http)   EXTERNAL-URL
auth            Running   auth.hasura              https://auth.oblong44.hasura-app.io
data            Running   data.hasura              https://data.oblong44.hasura-app.io
filestore       Running   filestore.hasura         https://filestore.oblong44.hasura-app.io
gateway         Running   gateway.hasura           
le-agent        Running   le-agent.hasura          
notify          Running   notify.hasura            https://notify.oblong44.hasura-app.io
platform-sync   Running   platform-sync.hasura     
postgres        Running   postgres.hasura          
session-redis   Running   session-redis.hasura     
sshd            Running   sshd.hasura              
vahana          Running   vahana.hasura
```

Find the EXTERNAL-URL for the service named `bot`(in this case -> https://bot.oblong44.hasura-app.io).

### Enabling webhooks

In your fb app page, scroll down until you find a card name `Webhooks`. Click on the `setup webhooks` button.

![Enable webhooks2](https://raw.githubusercontent.com/vipulrawat/fb-pincode-bot/master/assets/4.png "fb webhook screen")

* The `callback URL` is the URL that the facebook servers will hit to verify as well as forward the messages sent to our bot. The nodejs app in this project uses the `/webhook` path as the `callback URL`. Making the `callback URL` https://bot.YOUR-CLUSTER-NAME.hasura-app.io/webhook (in this case -> https://bot.oblong44.hasura-app.io/webhook/)
* The `verify token`is the verify token that you set in your secrets above (in the command $ hasura secrets update bot.fb_verify_token.key <YOUR-VERIFY-TOKEN>)
* After selecting all the `Subsciption Fields`. Submit and save.
![Subsciption page](https://raw.githubusercontent.com/vipulrawat/fb-pincode-bot/master/assets/5.png "fb subscribe screen")
* You will also see another section under `Webhooks` that says `Select a page to subscribe your webhook to the page events`, ensure that you select the respective facebook page here.

Next, open up your facebook page.

* Hover over the **Send Message** button and click on Test Button.

* Instead, if your button says **+ Add Button**, click on it.

![Add button](https://github.com/vipulrawat/fb-faceAnalysis-bot/blob/master/assets/addButton.png "Add Button screen")

* Next, click on **Use our messenger bot**. Then, **Get Started** and finally **Add Button**.
* You will now see that the **+ Add button** has now changed to **Get Started**. Hovering over this will show you a list with an item named **Test this button**. Click on it to start chatting with your bot.
* Send a message to your bot.

Test out your bot, on receiving a movie name it should respond with details about that movie.

## How to

### make own Bot
Till now you have successfully deployed our Pincode bot, But what If you have some brilliant Idea and want to make your own Bot with your own Idea,Customization and Functionalities? Then, follow the below links that will allow you to edit the `server.js` file to build your own bot.

* Read Official Tutorial on making your own Bot [here](https://github.com/jaisontj/hasura-fb-bot/blob/master/README.md#tutorial)
* Some worthy articles on Chat-Bots [here](https://medium.com/chat-bots)
* Another good Tutorial [here](https://github.com/jw84/messenger-bot-tutorial/blob/master/README.md)

### share your bot

* Go [here](https://developers.facebook.com/docs/messenger-platform/plugin-reference) to learn how to add a chat button your page.
* You can use https://m.me/<PAGE_USERNAME> to have someone start a chat.

### publish your bot
Currently, our bot is not published and for it to work with users other than you. You need to submit your bot to Facebook for review. Once Facebook approves your bot, it will be live.
The steps involved in publishing your bot to Facebook can be found [here](https://developers.facebook.com/docs/messenger-platform/app-review/).

## How can I help you?
If you happen to get stuck anywhere, feel free to raise an issue [here](https://github.com/vipulrawat/fb-pincode-bot) or email [me](mailto:vipulrawat.imi@live.in).
