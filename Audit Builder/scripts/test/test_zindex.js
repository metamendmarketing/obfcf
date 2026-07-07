const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .group:hover { z-index: 20; }
          .z-0 { z-index: 0; }
          .z-10 { z-index: 10; }
          .z-20 { z-index: 20; }
          .z-50 { z-index: 50; }
          .relative { position: relative; }
          .absolute { position: absolute; }
          .grid { display: grid; }
          .col-start-1 { grid-column-start: 1; }
          .row-start-1 { grid-row-start: 1; }
        </style>
      </head>
      <body>
        <div class="grid col-start-1 row-start-1" style="width: 500px; height: 500px;">
          <!-- Image Wrapper -->
          <div id="image-wrapper" class="group col-start-1 row-start-1 relative z-0" style="width: 200px; height: 200px; top: 50px; left: 50px; background: rgba(255,0,0,0.5);">
            <img id="image" style="width: 100%; height: 100%; pointer-events: auto;" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" />
          </div>
          
          <!-- Text Box Wrapper -->
          <div id="text-wrapper" class="col-start-1 row-start-1 relative z-10" style="width: 200px; height: 200px; top: 100px; left: 100px; background: rgba(0,0,255,0.5);">
            Text Box
          </div>
        </div>
      </body>
    </html>
  `);

  // Hover over the overlapping area (x: 150, y: 150)
  // At (150,150), both the image and text box intersect.
  // Initially, text-wrapper (z-10) should be on top.
  let topEl1 = await page.evaluate(() => {
    return document.elementFromPoint(150, 150).id;
  });

  // Now hover over the image specifically at (60, 60) which is NOT overlapped by the text box.
  await page.mouse.move(60, 60);

  // Now check the overlapping area again!
  let topEl2 = await page.evaluate(() => {
    return document.elementFromPoint(150, 150).id;
  });

  console.log("Before hover:", topEl1);
  console.log("After hover:", topEl2);

  await browser.close();
})();
