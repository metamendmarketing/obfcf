const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://tools.metamend.ca/audits/view/0999c7ce-7d03-4c51-95d6-962253a97022', { waitUntil: 'networkidle0' });
  await page.click('button');
  await new Promise(r => setTimeout(r, 2000));
  
  const imgsInfo = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img:not([src*="metamend_logo"])')).map(img => ({
      src: img.src.substring(0, 40) + '...',
      className: img.className,
      parentClassName: img.parentElement ? img.parentElement.className : 'NONE',
      width: img.clientWidth
    }));
  });
  
  console.log(imgsInfo.slice(0, 10)); // print first 10
  
  await browser.close();
})();
