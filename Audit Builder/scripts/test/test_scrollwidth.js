const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0; background: #ccc;">
        <!-- Scenario 1: Parent has overflow-hidden -->
        <div id="parent1" style="width: 850px; height: 1100px; overflow: hidden; background: white; margin-bottom: 20px;">
          <div id="content1" style="height: 1100px; column-width: 850px; column-gap: 20px; column-fill: auto;">
            <div style="width: 850px; height: 3000px; background: red;"></div>
          </div>
        </div>

        <!-- Scenario 2: Parent does NOT have overflow-hidden -->
        <div id="parent2" style="width: 850px; height: 1100px; background: white;">
          <div id="content2" style="height: 1100px; column-width: 850px; column-gap: 20px; column-fill: auto;">
            <div style="width: 850px; height: 3000px; background: blue;"></div>
          </div>
        </div>
      </body>
    </html>
  `);

  const metrics = await page.evaluate(() => {
    return {
      content1ScrollWidth: document.getElementById('content1').scrollWidth,
      parent1ScrollWidth: document.getElementById('parent1').scrollWidth,
      content2ScrollWidth: document.getElementById('content2').scrollWidth,
      parent2ScrollWidth: document.getElementById('parent2').scrollWidth,
    };
  });

  console.log("Metrics:", metrics);
  await browser.close();
})();
