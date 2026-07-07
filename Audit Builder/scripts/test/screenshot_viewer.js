const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const url = process.argv[2] || 'https://tools.metamend.ca/view/0999c7ce-7d03-4c51-95d6-962253a97022';
  console.log(`Loading: ${url}`);
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 }
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE:', msg.text()));
  
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.log("Timeout, but proceeding"));
  
  // Wait for the Enter Presentation button and click it if it exists
  try {
    const btn = await page.$('button');
    if (btn) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Enter Presentation')) {
        await btn.click();
        await page.waitForTimeout(2000);
      }
    }
  } catch (e) {
    console.log("No enter button found");
  }

  await page.screenshot({ path: 'viewer_screenshot.png' });

  // Dump total pages
  const metrics = await page.evaluate(() => {
    const wrapper = document.getElementById('presentation-preview-wrapper');
    const scrollWidth = wrapper ? wrapper.scrollWidth : null;
    
    // Find left/right buttons
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      html: b.outerHTML.substring(0, 100),
      text: b.textContent,
      style: b.getAttribute('style'),
      className: b.className
    }));

    return { scrollWidth, buttons };
  });

  fs.writeFileSync('viewer_metrics.json', JSON.stringify(metrics, null, 2));
  console.log("Saved screenshot to viewer_screenshot.png and metrics to viewer_metrics.json");

  await browser.close();
})();
