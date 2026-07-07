const fs = require('fs');
const https = require('https');

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

async function main() {
  const cssUrl = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap';
  const options = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' } };
  
  console.log('Fetching CSS...');
  const cssBuffer = await fetch(cssUrl, options);
  const cssContent = cssBuffer.toString();
  
  let finalCss = '';
  const regex = /@font-face\s*{[^}]*font-weight:\s*(400|700);[^}]*src:\s*url\((https:\/\/[^)]+)\)[^}]*}/g;
  let match;
  
  while ((match = regex.exec(cssContent)) !== null) {
    const weight = match[1];
    const woffUrl = match[2];
    console.log(`Fetching WOFF2 for weight ${weight} from ${woffUrl}...`);
    
    const fontBuffer = await fetch(woffUrl);
    const base64 = fontBuffer.toString('base64');
    finalCss += `@font-face { font-family: 'Outfit'; font-style: normal; font-weight: ${weight}; src: url(data:font/woff2;charset=utf-8;base64,${base64}) format('woff2'); }\n`;
  }
  
  fs.writeFileSync('src/app/outfit-base64.css', finalCss);
  console.log('Successfully wrote true base64 CSS!');
}

main();
