const request = require('request')

const token = "EAAGZAivn8YWsBAAZAsT7V2z4FZCqGK4jEEPe1w0chZCFcWtqWBEiZCZALZAA5wi8nD3norum5PLptMNfkPjaK5LXgNYSOUZCUcsd6G0p8uiVnHNZCjuboWPQZCPew0OA2zgswPm1ZB2CFRCo1xBbhNZAZCyvdwwH1PSJFUOYR4IXQZCVxlTAZDZD"

const sendMessage = (id, message) => {
  request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: token },
		method: 'POST',
		json: {
			recipient: { id: id },
			message: message
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

module.exports = sendMessage;
