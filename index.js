const { resolve } = require("path");
const { exit } = require("process");
const schedule = require('node-schedule')
const moment = require("moment")
const fs = require("fs");

const lnbitconnect = require("./utils/lnbitsconnect.js");
const convert = require("./utils/convertsvg.js");
const twitter = require("./utils/twitter.js");

const config = require("./config.js").lnbitsConfig;
const configTwitter = require("./config.js").twitterConfig
const logger = require("./utils/logger.js");
const { info } = require("console");


const lnbits_remote = {
  admin_key: config.admin_key,
  host: config.host,
};

const lnbits_lnurlw_params = {
  min_withdrawable: config.min_withdrawable,
  max_withdrawable: config.max_withdrawable,
  uses: config.uses,
  wait_time: config.wait_time,
};

async function uploadLnUrlImg(lnurl) {
  // Get Lnurl shareable link
  let lnurl_link = "https://" + lnbits_remote.host + "/withdraw/" + lnurl.id

  // get SVG qrcode
  const svg = await lnbitconnect.getLnUrlWImg(lnurl, lnbits_remote);
  
  // convert it to png and save it on a tmp file
  await convert.convertSvg2Img(svg);

  // upload it to twitter
  const { media_id_string } = await twitter.uploadImg();

  // delete tmp image file
  fs.unlinkSync("lnurl.png");

  // send tweet (start giveaway)
  const tweet = await twitter.sendTweet(media_id_string, lnurl_link);
  logger.info(`You've successfully tweeted this : ${tweet.text}`);
  return tweet;
}


function sleep(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

async function endGiveaway(lnurl, tweet) {
  logger.info("Giveway ended.");

  try {
    //await lnbitconnect.delLnUrlW(lnurl, lnbits_remote);
   //logger.info("LNURL deleted");
  } catch (err) {
    logger.info("An error occured while trying to delete LNURL");
  }

  try {
    getWallet(lnbits_remote)
    .then(async function (wallet) {
      let close = await twitter.replyTweet(tweet.id_str, wallet.balance);
      logger.info(`Giveaway closing tweet has been sent : ${close.text}`);
    })
    .catch(() => {
      logger.info("Cannot connect to lnbits wallets");
    });

  } catch (err) {
    logger.info(
      "An error occured while trying to send giveaway closing tweet",
      err
    );
  }

}

async function checkEndGiveaway(lnurl, tweet) {
  let { used } = await lnbitconnect.getLnUrlW(lnurl, lnbits_remote);

  while (used < config.uses) {
    await sleep(10000);

    const { used: updatedUsed } = await lnbitconnect.getLnUrlW(
      lnurl,
      lnbits_remote
    );

    //logger.info(`Giveaway usage status: ${updatedUsed}`);
    used = updatedUsed;
  }
  
  await endGiveaway(lnurl, tweet);
}

async function runBot() {
  // Create lnurl
  const lnurl = await lnbitconnect.createLnUrlW(
    lnbits_remote,
    lnbits_lnurlw_params
  );

  const tweet = await uploadLnUrlImg(lnurl);

  await checkEndGiveaway(lnurl, tweet);
}



lnbitconnect
  .getWallet(lnbits_remote)
  .then(async function (wallet) {
    logger.info(`Connected to wallet: ${wallet.name}`);
    logger.info(configTwitter.start_giveaway)
    try {
      const rule = new schedule.RecurrenceRule();
      // run the bot once a day randomly
      let hour=between(7,21)
      let minute=between(0,59)
      //let hour = moment().hours()
      //let minute = moment().minutes()
      let second = moment().add(1, "second").second()
      logger.info("--------------")
      logger.info('Next job ' + hour + ':' + minute)

      //rule.second=second
      rule.minute=minute
      rule.hour=hour
      const job = schedule.scheduleJob(rule, async function() {
        console.log("--------------")
        await runBot();
        job.cancel()
        rule.minute=between(0,59)
        rule.hour=between(7,21)
        rule.date=moment().add(1,"days").date()
        logger.info('Next job ' + rule.date + ' ' + rule.hour + ':' + minute)
        job.reschedule(rule)

      });
    } catch (err) {
      logger.info(err);
    }
    
})
.catch(() => {
  logger.info("Cannot connect to lnbits wallets");
});
