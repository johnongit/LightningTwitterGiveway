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
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
async function runBot() {
    try {
        lnurl = await lnbitconnect.createLnUrlW(lnbits_remote, lnbits_lnurlw_params)
        lnurl = JSON.parse(lnurl)
        svg = await lnbitconnect.getLnUrlWImg(lnurl,lnbits_remote)
        
        await convert.convertSvg2Img(svg)
        let imgupld = await twitter.uploadImg()
        let media_id_string = imgupld.media_id_string

        // delete image file
        fs.unlinkSync('lnurl.png')

        let tweet = await twitter.sendTweet(media_id_string)
        console.log('You successfully tweeted this : "' + tweet.text + '"');
        
       used = JSON.parse(await lnbitconnect.getLnUrlW(lnurl, lnbits_remote)).used
       uses = JSON.parse(await lnbitconnect.getLnUrlW(lnurl, lnbits_remote)).uses
       console.log(uses)
       while(used<config.uses) {
        await sleep(10000);
        used = JSON.parse(await lnbitconnect.getLnUrlW(lnurl, lnbits_remote)).used
        console.log(used)
       }
       console.log("Giveway terminé.")
       try {
        lnbitconnect.delLnUrlW(lnurl, lnbits_remote)
        console.log("LNURL supprimé")
       }
       catch {
           return "Impossible de supprimer la LNurl"
       }

       try {
           let close = await twitter.replyTweet(tweet.id_str)
           console.log("Le tweet de de fermeture a été envoyé ", close)
       }
       catch (err){
           console.log("error", err)
           return "Impossible de supprimer le tweet " + err
       }



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


