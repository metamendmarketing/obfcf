const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  
  await page.goto('http://localhost:3000/79ed5435-d876-43a9-9a3a-ff1fcf862035/edit', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  const result = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.group')).map(el => ({
      className: el.className,
      hasImg: !!el.querySelector('img'),
      hasText: !!el.innerText
    }));
  });
  
  console.log(result);
  await browser.close();
})();
