const request = require('request')

const apiKey = 'gBNvowWWwLhoJpZ5Y3Sc9nrBs'
const apiSecret = 'RPMvKjleNrJ0BxK7CfuYaF2ioyC1moMRyc3UXao4EjfHd5ROMq'
const bearerToken = new Buffer(`${apiKey}:${apiSecret}`).toString('base64')

let mem = {};

function requestBearerToken() {
  return new Promise(function(resolve, reject) {
    request({
      url: 'https://api.twitter.com/oauth2/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${bearerToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: 'grant_type=client_credentials'
    }, function(error, response) {
  		if (error) {
  			reject(error)
  		} else if (response.body.error) {
  			reject(response.body.error)
  		}

      resolve(response)
  	})
  })
  .then(function(response) {
    let credentials = JSON.parse(response.body)
    mem.token_type = credentials.token_type
    mem.access_token = credentials.access_token
  })
  .catch(function(error) {
    console.log('Error sending messages: ', error)
  })
}

function getTrending() {
  const token_type = mem.token_type
  const access_token = mem.access_token

  if (access_token) {

    return new Promise(function(resolve, reject) {
      request({
        url: 'https://api.twitter.com/1.1/trends/place.json',
        method: 'GET',
        qs: { id: 23424977 },
        headers: {
          'Authorization': `${token_type} ${access_token}`
        }
      }, function(error, response) {
        if (error) {
          requestBearerToken().then(getTrending).catch(reject)
        }

        resolve(response)
      })
    });

  } else {
    return requestBearerToken().then(getTrending)
  }
}

module.exports.getTrending = getTrending;
