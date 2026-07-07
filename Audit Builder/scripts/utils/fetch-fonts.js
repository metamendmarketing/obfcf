const fs = require('fs');
const https = require('https');

function downloadAndEncode(url, weight) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const base64 = buffer.toString('base64');
        const css = `@font-face { font-family: 'Outfit'; font-style: normal; font-weight: ${weight}; src: url(data:font/woff2;charset=utf-8;base64,${base64}) format('woff2'); }\n`;
        resolve(css);
      });
    });
  });
}

async function main() {
  const css400 = await downloadAndEncode('https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq.woff2', 400);
  const css700 = await downloadAndEncode('https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuEtq.woff2', 700);
  fs.writeFileSync('src/app/outfit-base64.css', css400 + css700);
  console.log('Successfully wrote base64 CSS');
}

main();
