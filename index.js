var fs = require("fs");

const lnbitconnect = require("./utils/lnbitsconnect.js");
const convert = require("./utils/convertsvg.js");
const twitter = require("./utils/twitter.js");

const config = require("./config.js").lnbitsConfig;
const logger = require("./utils/logger.js");

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
  // get SVG qrcode
  const svg = await lnbitconnect.getLnUrlWImg(lnurl, lnbits_remote);

  // convert it to png and save it on a tmp file
  await convert.convertSvg2Img(svg);

  // upload it to twitter
  const { media_id_string } = await twitter.uploadImg();

  // delete tmp image file
  fs.unlinkSync("lnurl.png");

  // send tweet (start giveaway)
  const tweet = await twitter.sendTweet(media_id_string);
  logger.info(`You've successfully tweeted this : ${tweet.text}`);
  return tweet;
}

function sleep(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

async function endGiveaway(lnurl, tweet) {
  logger.info("Giveway ended.");

  try {
    await lnbitconnect.delLnUrlW(lnurl, lnbits_remote);
    logger.info("LNURL deleted");
  } catch (err) {
    logger.info("An error occured while trying to delete LNURL");
  }

  try {
    let close = await twitter.replyTweet(tweet.id_str);
    logger.info(`Giveaway closing tweet has been sent : ${close.text}`);
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

    logger.info(`Giveaway usage status: ${updatedUsed}`);
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

    try {
      await runBot();
    } catch (err) {
      logger.info("Error", err);
    }
  })
  .catch(() => {
    logger.info("Cannot connect to lnbits wallets");
  });
