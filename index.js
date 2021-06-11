const { resolve } = require("path");
const { exit } = require("process");
var fs = require('fs');



const lnbitconnect = require('./utils/lnbitsconnect.js');
const convert = require('./utils/convertsvg.js');
const twitter = require('./utils/twitter.js');

var config = require('./config.js').lnbitsConfig;



var lnbits_remote={
    "admin_key":config.admin_key,
    "host":config.host
}
var lnbits_lnurlw_params={
    "min_withdrawable":config.min_withdrawable,
    "max_withdrawable":config.max_withdrawable,
    "uses":config.uses,
    "wait_time": config.wait_time
}

lnbitconnect.getWallet(lnbits_remote)
.then(function (wallet) {
    wallet = JSON.parse(wallet)
    console.log("Connect to wallet: ", wallet.name)
})

.then(function() {
    return lnbitconnect.createLnUrlW(lnbits_remote,lnbits_lnurlw_params)
})
.then(function(lnurl) {
    lnurl = JSON.parse(lnurl)
    return lnurl
})
.then(function(lnurl) {
    return lnbitconnect.getLnUrlWImg(lnurl,lnbits_remote)
})
.then(function(img) { 
    return convert.convertSvg2Img(img)
})
.then(function () {
    return twitter.uploadImg()
})
.then(function (result) {
    media_id = result.media_id_string

    message={
        "status": "Giveaway lightning de test",
        "media_ids": media_id
    }
    return twitter.sendTweet(message)
})
.catch(function(err) {
    console.log("error: ", err)
})




