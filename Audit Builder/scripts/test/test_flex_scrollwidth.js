const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0;">
        <div id="presentation-preview-wrapper" style="display: flex;">
          <div id="live-preview" style="display: flex; gap: 20px; height: 1100px;">
            <div id="paginated-section" style="width: 850px; flex-shrink: 0; position: relative;">
              <div id="content" style="height: 1100px; column-width: 850px; column-gap: 20px; column-fill: auto;">
                <div style="width: 850px; height: 3000px; background: red;"></div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);

  const metrics = await page.evaluate(() => {
    return {
      wrapperScrollWidth: document.getElementById('presentation-preview-wrapper').scrollWidth,
      livePreviewScrollWidth: document.getElementById('live-preview').scrollWidth,
      sectionScrollWidth: document.getElementById('paginated-section').scrollWidth,
      contentScrollWidth: document.getElementById('content').scrollWidth,
    };
  });

  console.log("Metrics:", metrics);
  await browser.close();
})();
