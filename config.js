const env = require('dotenv').config();

var lnbitsConfig = {
    admin_key: process.env.LNBITS_ADMIN_KEY,
    host: process.env.LNBITS_HOST,
    min_withdrawable: 10,
    max_withdrawable: 10,
    uses: 5,
    wait_time: 60
}

var twitterConfig = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
}

module.exports = {
    lnbitsConfig,
    twitterConfig,
  };