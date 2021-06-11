
var https = require("https");




function getWallet(lnbits_remote) {
    options = {
        host: lnbits_remote.host,
        port: 443,
        path: '/api/v1/wallet',
        method: 'GET',
        headers: {
            "X-Api-Key": lnbits_remote.admin_key
        }
    };
    return new Promise(function(resolve, reject) {
        var req = https.request(options, function(res) {
            if(res.statusCode == 200) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    resolve(chunk)
                });
            } else {
                reject(res)
            }
        });
        req.on('error', (e) => {

            reject(e)
        });
        req.end();
    });
}

function createLnUrlW(lnbits_remote,lnbits_lnurlw_params) {
    data = JSON.stringify({
        title: "LnURL Giveaway",
        min_withdrawable: lnbits_lnurlw_params.min_withdrawable,
        max_withdrawable: lnbits_lnurlw_params.max_withdrawable,
        uses: lnbits_lnurlw_params.uses,
        wait_time: lnbits_lnurlw_params.wait_time,
        is_unique:false
    })
    options = {
        host: lnbits_remote.host,
        port: 443,
        path: '/withdraw/api/v1/links',
        method: 'POST',
        headers: {
            "X-Api-Key": lnbits_remote.admin_key,
            'Content-Length': data.length,
            'Content-Type': 'application/json',
        }
    };
    
    return new Promise(function(resolve, reject) {
        var req = https.request(options, function(res) {
            if(res.statusCode == 201) {
                res.setEncoding('utf8');
                res.on('data', d => {
                    resolve(d)
                })
            }
            else {
                reject("Connot create LNURL, status code " + res.statCode);
            }
        });
        req.on('error', err => {
            reject(err);
            
        })
        
        req.write(data)
        req.end()
    });
}

function getLnUrlWImg(params,lnbits_remote) {
    options = {
        host: lnbits_remote.host,
        port: 443,
        path: '/withdraw/img/' + params.id,
        method: 'GET',
        headers: {
            "X-Api-Key": lnbits_remote.admin_key
        }
    };
    return new Promise(function(resolve, reject) {
        var req = https.request(options, function(res) {

            if(res.statusCode == 200) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    resolve(chunk)
                });
            } else {
                reject(res)
            }
        });
        req.on('error', (e) => {
            reject(e)
        });
        req.end();
    })
}

module.exports = {
    getWallet,
    createLnUrlW,
    getLnUrlWImg,
}