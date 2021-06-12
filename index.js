const { resolve } = require("path");
const { exit } = require("process");
var fs = require('fs');
const schedule = require('node-schedule')
const moment = require("moment")



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
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
  }
async function runBot() {
    try {
        console.log("Start Giveaway")
        // Create lnurl
        lnurl = await lnbitconnect.createLnUrlW(lnbits_remote, lnbits_lnurlw_params)
        lnurl = JSON.parse(lnurl)
        // get SVG qrcode and convert it to png
        svg = await lnbitconnect.getLnUrlWImg(lnurl,lnbits_remote)
        await convert.convertSvg2Img(svg)

        // upload it to twitter
        /*
        let imgupld = await twitter.uploadImg()
        let media_id_string = imgupld.media_id_string

        // delete image file
        fs.unlinkSync('lnurl.png')
        
        // send tweet (start giveaway)
        let tweet = await twitter.sendTweet(media_id_string)
        console.log('You successfully tweeted this : "' + tweet.text + '"');
        */
        // check giveaway usage
        lnurllink = JSON.parse(await lnbitconnect.getLnUrlW(lnurl, lnbits_remote))
        used = lnurllink.used
        uses = lnurllink.uses

        //poll lnurl usage
        while(used<config.uses) {
            await sleep(10000);
            used = JSON.parse(await lnbitconnect.getLnUrlW(lnurl, lnbits_remote)).used
        }

        // giveaway empty, delete lnurl and close it on twitter
        console.log("Giveway closed")
        lnbitconnect.delLnUrlW(lnurl, lnbits_remote)
        .then(() => { 
            console.log("LNURL deleted")
        })
        .catch ((err) => {
            console.log("Cannot delete LNURL")
        })
        /*
        twitter.replyTweet(tweet.id_str)
        .then((tweet) => {
            console.log("Le tweet de de fermeture a été envoyé ", tweet.txt)
            console.log("Close tweet sent ", tweet.txt)
        })
        .catch ((err) => {
            console.log("Cannot send close tweet")
        })
        */



    } catch (err) {
        console.log("Error", err)
    }
}

lnbitconnect.getWallet(lnbits_remote)
.then(function (wallet) {
    wallet = JSON.parse(wallet)
    console.log("Connected to wallet: ", wallet.name)
    const rule = new schedule.RecurrenceRule();
    rule.minute=between(0,59)
    const job = schedule.scheduleJob(rule, function(){
        let date = new Date().toISOString()
        console.log("--------------")
        console.log(date);
        runBot()
        .catch((err) => console.log("Error ", err))
        job.cancel()
        rule.minute=between(0,59)
        rule.hour= moment().add(1,"hour").hour()
        job.reschedule(rule)
    });
})
.catch((err) => {
    console.log("Cannot connect to lnbits wallets");
})
