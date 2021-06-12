const { resolve } = require("path");
const { exit } = require("process");
var fs = require('fs');



const lnbitconnect = require('./utils/lnbitsconnect.js');
const convert = require('./utils/convertsvg.js');
const twitter = require('./utils/twitter.js');

const config = require('./config.js').lnbitsConfig;



const lnbits_remote={
    "admin_key":config.admin_key,
    "host":config.host
}
const lnbits_lnurlw_params={
    "min_withdrawable":config.min_withdrawable,
    "max_withdrawable":config.max_withdrawable,
    "uses":config.uses,
    "wait_time": config.wait_time
}

async function runBot() {
    try {
        lnurl = await lnbitconnect.createLnUrlW(lnbits_remote, lnbits_lnurlw_params)
        lnurl = JSON.parse(lnurl)
        svg = await lnbitconnect.getLnUrlWImg(lnurl,lnbits_remote)
        await convert.convertSvg2Img(svg)
        imgupld = await twitter.uploadImg()
        media_id_string = imgupld.media_id_string
        fs.unlinkSync('lnurl.png')

        tweet = await twitter.sendTweet(media_id_string)
        console.log('You successfully tweeted this : "' + tweet.text + '"');

    }
    catch (err) {
        console.log(err)
    }
}

lnbitconnect.getWallet(lnbits_remote)
.then(function (wallet) {
    wallet = JSON.parse(wallet)
    console.log("Connected to wallet: ", wallet.name)
    runBot();
})
.catch((err) => {
    console.log("Cannot connect to lnbits wallets");
})


