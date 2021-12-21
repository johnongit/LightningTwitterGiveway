require("dotenv").config();

const lnbitsConfig = {
  admin_key: process.env.LNBITS_ADMIN_KEY,
  host: process.env.LNBITS_HOST,
  min_withdrawable: 200,
  max_withdrawable: 200,
  uses: 40,
  wait_time: 60,
};

const twitterConfig = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  start_giveaway: "Giveaway #bitcoin ! Munissez-vous d'un wallet lightning comme @ZeusLN @bluewalletio @MuunWallet (ou @PhoenixWallet si vous l'utilisez régulièrement).\r\n@walletofsatoshi déconseillé ! \r\n" + lnbitsConfig.uses + " x " + lnbitsConfig.min_withdrawable + " Satoshis à gagner. \r\nCooldown de " + lnbitsConfig.wait_time / 60 + " minutes.",
  stop_giveaway: "C'est terminé ! \n\nRendez-vous sur https://stream.openchain.fr pour voir la balance du faucet et faire une donation si vous le souhaitez. Tu peux me laisser un message ici https://lnbits.openchain.fr/tipjar/2",
};

module.exports = {
  lnbitsConfig,
  twitterConfig,
};
