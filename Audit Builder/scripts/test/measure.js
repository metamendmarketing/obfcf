const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const url = process.argv[2] || 'http://localhost:3000/view/0999c7ce-7d03-4c51-95d6-962253a97022';
  console.log(`Measuring layouts for: ${url}`);
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set a massive viewport so we capture everything
  await page.setViewport({ width: 1440, height: 10000 });
  
  page.on('console', msg => console.log('PAGE:', msg.text()));
  
  console.log("Navigating to page...");
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  
  console.log("Waiting for content to settle...");
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));
  
  console.log("Extracting coordinates...");
  
  const coords = await page.evaluate(() => {
    const elements = document.querySelectorAll('.group[data-finding-id]');
    const results = [];
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      results.push({
        findingId: el.getAttribute('data-finding-id'),
        type: el.getAttribute('data-type'),
        y: rect.top + window.scrollY,
        x: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
    });
    
    return results;
  });
  
  await page.screenshot({ path: 'puppeteer_debug.png', fullPage: true });
  console.log(`Found ${coords.length} elements.`);
  
  fs.writeFileSync('coords_pristine.json', JSON.stringify(coords, null, 2));
  console.log("Saved to coords_pristine.json");
  
  await browser.close();
})();
