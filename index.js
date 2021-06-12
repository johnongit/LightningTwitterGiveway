const { resolve } = require("path");
const { exit } = require("process");
var fs = require("fs");
const schedule = require("node-schedule");

const lnbitconnect = require("./utils/lnbitsconnect.js");
const convert = require("./utils/convertsvg.js");
const twitter = require("./utils/twitter.js");

const config = require("./config.js").lnbitsConfig;

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

async function uploadLnUrlImg() {
  // get SVG qrcode and convert it to png
  const svg = await lnbitconnect.getLnUrlWImg(lnurl, lnbits_remote);

  // convert it and save it on a tmp file
  await convert.convertSvg2Img(svg);

  // upload it to twitter
  const { media_id_string } = await twitter.uploadImg();

  // delete tmp image file
  fs.unlinkSync("lnurl.png");

  // send tweet (start giveaway)
  const tweet = await twitter.sendTweet(media_id_string);
  console.log(`You've successfully tweeted this : ${tweet.text}`);
}

function checkEndGiveaway() {
  // each 10 seconds, cehck giveaway status
  const interval = setInterval(async () => {
    const { used: updatedUsed } = await lnbitconnect.getLnUrlW(
      lnurl,
      lnbits_remote
    );

    if (updatedUsed >= config.uses) {
      await endGiveaway();
      clearInterval(interval);
    }
  }, 10000);
}

async function endGiveaway() {
  console.log("Giveway ened.");
  try {
    await lnbitconnect.delLnUrlW(lnurl, lnbits_remote);
    console.log("LNURL deleted");
  } catch (err) {
    console.log("An error occured while trying to delete LNURL", err);
  }

  try {
    let close = await twitter.replyTweet(tweet.id_str);
    console.log(`Giveaway closing tweet has been sent : ${close.txt}`);
  } catch (err) {
    console.log(
      "An error occured while trying to send giveaway closing tweet",
      err
    );
  }
}

async function runBot() {
  // Create lnurl
  const lnurl = await lnbitconnect.createLnUrlW(
    lnbits_remote,
    lnbits_lnurlw_params
  );

  await uploadLnUrlImg();

  checkEndGiveaway();
}

lnbitconnect
  .getWallet(lnbits_remote)
  .then(async function (wallet) {
    console.log("Connected to wallet: ", wallet.name);

    try {
      await runBot();
    } catch (err) {}
  })
  .catch((err) => {
    console.log("Cannot connect to lnbits wallets");
  });
