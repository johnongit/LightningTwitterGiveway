const Twitter = require('twitter');

const config = require('../config.js').twitterConfig;


const client = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret,
  });

function sendTweet(media_id_string, lnurl_link) {
     
    let status = config.start_giveaway + "\n" + lnurl_link

    let message={
        "status": status,
        "media_ids": media_id_string
    }
    return new Promise(function(resolve, reject) {
        client.post('statuses/update', message)
        .then(result => {
            resolve(result)
        })
        .catch((err) => reject(err));
    });
}

function replyTweet(status_id) {
    let message={
        "status": config.stop_giveaway,
        "in_reply_to_status_id": status_id
    }
    return new Promise(function(resolve, reject) {
        client.post('statuses/update', message)
        .then(result => {
            resolve(result)
        })
        .catch((err) => reject(err));
    });
}

function uploadImg() {
    const data = require('fs').readFileSync('./lnurl.png');

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
    replyTweet,
}