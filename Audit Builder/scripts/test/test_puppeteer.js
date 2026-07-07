const puppeteer = require('puppeteer');

(async () => {
  const url = process.argv[2] || 'https://tools.metamend.ca/audits/view/0999c7ce-7d03-4c51-95d6-962253a97022';
  console.log("Launching Puppeteer...");
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    console.log("Opening new page...");
    const page = await browser.newPage();
    
    // Capture console output
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.error('REQUEST FAILED:', request.url(), request.failure().errorText));

    console.log(`Target: ${url}`);
    
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 20000
    });
    
    console.log("Navigation successful!");
    
    // Take a screenshot to see what's rendering
    await page.screenshot({ path: 'screenshot_share.png' });
    console.log("Screenshot saved to screenshot_share.png");
    
    await browser.close();
  } catch (error) {
    console.error("Puppeteer test failed:", error);
  }
})();
