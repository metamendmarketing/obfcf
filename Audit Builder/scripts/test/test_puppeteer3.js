const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://tools.metamend.ca/audits/view/0999c7ce-7d03-4c51-95d6-962253a97022', { waitUntil: 'networkidle0' });
  await page.click('button');
  await new Promise(r => setTimeout(r, 2000));
  
  await page.exposeFunction('logClick', (msg) => console.log('Click result:', msg));
  await page.evaluate(() => {
    document.addEventListener('click', (e) => {
      window.logClick('Clicked on ' + e.target.tagName + ' class: ' + e.target.className);
    }, true);
  });
  
  const box = await page.evaluate(() => {
    const img = document.querySelector('#presentation-preview-wrapper img:not([src*="metamend_logo"])');
    if (!img) return null;
    img.scrollIntoView();
    const rect = img.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  });
  
  if (box) {
    console.log('Mouse clicking at', box.x, box.y);
    await page.mouse.click(box.x, box.y);
    await new Promise(r => setTimeout(r, 1000));
    const lightboxExists = await page.evaluate(() => !!document.querySelector('.cursor-zoom-out'));
    console.log('Lightbox exists?', lightboxExists);
  } else {
    console.log('No image found');
  }
  
  await browser.close();
})();
