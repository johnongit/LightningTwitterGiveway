const fs = require('fs');
const svg2img = require('svg2img');
const sharp = require('sharp');



function convertSvg2Img(svg) {
    return new Promise(function(resolve, reject) {
        const res = svg2img(svg,{format:'png'}, function(error, buffer) {

                sharp(buffer)
                .flatten({ background: '#FFFFFF' })
                .toFile('lnurl.png')
                .then(resolve)
                .catch(reject);
            
        });
    });
}

module.exports = {
    convertSvg2Img,
}