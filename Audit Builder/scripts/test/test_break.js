const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .columns {
            column-count: 2;
            column-gap: 20px;
            height: 500px;
            width: 800px;
            background: #eee;
            position: relative;
          }
          .anchor {
            position: relative;
            height: 10px;
            background: red;
            margin-top: 400px; /* Push anchor near bottom of col 1 */
          }
          .absolute-box {
            position: absolute;
            top: 50px; /* 450px total, starts in col 1 */
            width: 200px;
            height: 200px; /* ends at 650px, should break into col 2 */
            background: rgba(0, 0, 255, 0.5);
            border: 5px dashed purple;
          }
          .avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div class="columns">
          <div class="anchor">
            <div class="absolute-box"></div>
          </div>
        </div>
      </body>
    </html>
  `);

  await page.screenshot({ path: 'test_break.png' });
  await browser.close();
})();
