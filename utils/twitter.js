const Twitter = require('twitter');

var config = require('../config.js').twitterConfig;


const client = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret,
  });

function sendTweet(message) {
    return new Promise(function(resolve, reject) {
        client.post('statuses/update', message)
        .then(result => {
            console.log('You successfully tweeted this : "' + result.text + '"');
            resolve(result)
        })
        .catch((err) => reject(err));
    });
}
function uploadImg() {
    var data = require('fs').readFileSync('./lnurl.png');

    return new Promise(function(resolve, reject) {
        client.post('media/upload', {"media": data})
        .then((result) => {
            resolve(result)
        })
        .catch((err) => reject(err))
    });
}

module.exports = {
    sendTweet,
    uploadImg,
}