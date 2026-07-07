const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  await page.goto('https://tools.metamend.ca/audits/view/0999c7ce-7d03-4c51-95d6-962253a97022', { waitUntil: 'networkidle0' });
  
  // Enter presentation
  await page.click('button');
  await new Promise(r => setTimeout(r, 2000));
  
  // Expose function
  await page.exposeFunction('logClick', (msg) => console.log('Click result:', msg));
  
  // Inject click tracker
  await page.evaluate(() => {
    document.addEventListener('click', (e) => {
      window.logClick('Clicked on ' + e.target.tagName + ' class: ' + e.target.className);
    }, true);
  });
  
  // Find an image and click it
  const found = await page.evaluate(() => {
    const img = document.querySelector('#presentation-preview-wrapper img:not([src*="metamend_logo"])');
    if (img) {
      img.scrollIntoView();
      img.click();
      return true;
    }
    return false;
  });
  
  console.log('Image found and clicked:', found);
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Check lightbox
  const lightboxExists = await page.evaluate(() => !!document.querySelector('.cursor-zoom-out'));
  console.log('Lightbox exists?', lightboxExists);
  
  await browser.close();
})();
