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
const sendMessage = require('./sendMessage.js');
const getTrending = require('./twitterApi.js').getTrending;
const totalToRgb = require('./totalToRgb.js');

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(morgan('combined'))

// index
app.get('/', function(req, res) {
    res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    } else {
        res.send('Error, wrong token')
    }
})

// to post data
app.post('/webhook/', function(req, res) {
    const messaging_events = req.body.entry[0].messaging
    console.log(messaging_events)
    _.forEach(messaging_events, function(messaging_event) {
        const id = messaging_event.sender.id
        const message = messaging_event.message
        let text = message && messaging_event.message.text

        if (text) {
            text = text.toLowerCase();
            switch (text) {
                case 'hackhouston':
                    sendTextMessage(id, '22-23 April \n\nOn Saturday April 22, Texas Southern University will be hosting its first ever hackathon... \n\n@Texas Southern University Recreation Center')
                    break
                case 'basketball':
                    sendTextMessage(id, '21-23 April \n\nOn Friday April 21, The Oklahoma City Thunder beat the Rockets 115-113 in a playoff defining match after losing their two previous playoff games. Teams with an 0-2 deficit in the playoffs like the Thunder historically have a historically abysmal 7% chance of winning said series.\nThe next game will be Today, April 23 at 2:30 PM at OKC');
                    break;
                case 'domestic politics':

                default:
                    sendTextMessage(id, 'Opps, sorry but there\'s no topic related to that :(')
                    break
            }
        }

        const postback = messaging_event.postback
        let payload = postback && postback.payload

        if (postback) {
            switch (payload) {
                case 'USER_DEFINED_PAYLOAD':
                    sendGreetingMessage(id)
                    break
                case 'TRENDING_TOPICS':
                    return getTrending()
                        .then(response => JSON.parse(response.body)[0].trends.filter(t => t.tweet_volume).sort((a, b) => a.tweet_volume < b.tweet_volume))
                        .then(trends => {
                            sendTrendingMessage(id, trends)
                        })
                case 'MAKE_IT_RAIN':
                    break

                default:
                    payload = JSON.parse(decodeURI(payload))[0].payload
                    switch (payload.type) {
                        case 'VIEW_MORE_TRENDING':
                            return getTrending()
                                .then(response => JSON.parse(response.body)[0].trends.filter(t => t.tweet_volume).sort((a, b) => a.tweet_volume < b.tweet_volume))
                                .then(trends => {
                                    sendTrendingMessage(id, trends, { skip: payload.skip, limit: payload.limit })
                                })
                            break
                        default:
                            break
                    }
                    break
            }
        }

    })
    res.sendStatus(200)
})

const token = "EAAGZAivn8YWsBAAZAsT7V2z4FZCqGK4jEEPe1w0chZCFcWtqWBEiZCZALZAA5wi8nD3norum5PLptMNfkPjaK5LXgNYSOUZCUcsd6G0p8uiVnHNZCjuboWPQZCPew0OA2zgswPm1ZB2CFRCo1xBbhNZAZCyvdwwH1PSJFUOYR4IXQZCVxlTAZDZD"

function sendTrendingMessage(id, trends, options) {
    var min, max;
    options = options || {};
    var skip = options.skip ? options.skip : 0;
    var limit = options.limit ? options.limit : 3;

    _.forEach(trends, function(trend) {
        min = Math.min(min, trend.tweet_volume)
        max = Math.max(max, trend.tweet_volume)
    });

    let renderTrends = (trends, skip, limit) => trends.map(trend => ({
        title: trend.name,
        subtitle: `${trend.tweet_volume} tweets about this` || '',
        "default_action": {
            "type": "web_url",
            "url": trend.url.replace("http://", "https://"),
            "messenger_extensions": true,
            "webview_height_ratio": "tall"
        }
    })).slice(skip, skip + limit)

    let message = {
        attachment: {
            type: "template",
            payload: Object.assign({}, {
                template_type: "list",
                elements: skip ? renderTrends(trends, skip, limit) : [{
                        title: 'Trending Topics',
                        image_url: 'http://sanctuaryucc.org/wp-content/uploads/2015/03/Que-es-trending-topic-twitter-como-se-alcanza02-300x202.png'
                    },
                    renderTrends(trends, skip, limit)
                ],
                buttons: skip ? [{
                    title: 'Main Menu',
                    type: 'postback',
                    payload: 'USER_DEFINED_PAYLOAD'
                }] : [{
                    title: 'View More',
                    type: 'postback',
                    payload: encodeURI(JSON.stringify([{
                        title: 'View More',
                        type: 'postback',
                        payload: {
                            type: 'VIEW_MORE_TRENDING',
                            skip: 3,
                            limit: 4
                        }
                    }]))
                }]
            }, skip ? { top_element_style: 'compact' } : {})
        }
    }

    sendMessage(id, message)
}

function sendGreetingMessage(id) {
    let message = {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'button',
                text: 'We curate the most relevant topics to you right now so you\'ll never have to feel out of place again!',
                buttons: [{
                        "type": "postback",
                        "title": "Make it rain!",
                        "payload": "MAKE_IT_RAIN"
                    },
                    {
                        "type": "postback",
                        "title": "Trending in Twitter",
                        "payload": "TRENDING_TOPICS"
                    }
                ]
            }
        }
    }

    sendMessage(id, message)
}

function sendTextMessage(id, text) {
    let message = { text: text }
    sendMessage(id, message)
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
    }
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
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
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