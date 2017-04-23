//This is still work in progress
/*
Please report any bugs to nicomwaks@gmail.com

i have added console.log on line 48




 */
'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const https = require('https')
const morgan = require('morgan')
const _ = require('lodash')

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

app.use(morgan('combined'))

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	} else {
		res.send('Error, wrong token')
	}
})

// to post data
app.post('/webhook/', function (req, res) {
	const messaging_events = req.body.entry[0].messaging
	_.forEach(messaging_events, function(messaging_event) {
		const id = messaging_event.sender.id;
		const message = messaging_event.message;
		const text = message && messaging_event.message.text;
		if (message && text) {
			sendTextMessage(id, text.substring(0, 200))
		}
	})
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.FB_PAGE_ACCESS_TOKEN
const token = "EAAGZAivn8YWsBAAZAsT7V2z4FZCqGK4jEEPe1w0chZCFcWtqWBEiZCZALZAA5wi8nD3norum5PLptMNfkPjaK5LXgNYSOUZCUcsd6G0p8uiVnHNZCjuboWPQZCPew0OA2zgswPm1ZB2CFRCo1xBbhNZAZCyvdwwH1PSJFUOYR4IXQZCVxlTAZDZD"

function sendTextMessage(sender, text) {
	let messageData = { text:text }

	request({
		url: `https://graph.facebook.com/v2.6/me/messages?access_token=${token}`,
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function sendListMessage(sender) {
	let messageData = {
		attachment: {
			type: "template",
			payload: {
				template_type: "list",
				elements: [{

				}]
			}
		}
	};
}

function sendGenericMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.messenger.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
