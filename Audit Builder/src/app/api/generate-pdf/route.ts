import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const maxDuration = 120; // Allow 2 minutes for rendering complex documents

/**
 * @file route.ts
 * @description API Endpoint for headless PDF generation using Puppeteer/Chromium.
 * 
 * ARCHITECTURE NOTE:
 * Vercel has a strict 4.5MB payload limit for serverless functions, and local storage has a 5MB limit.
 * To bypass these, the engine performs the following:
 * 1. Fetches the raw state directly from the Supabase `app_state` table.
 * 2. Launches a headless Chromium instance via `@sparticuz/chromium`.
 * 3. Navigates to `/audits/[id]/report?headless=true`.
 * 4. Injects the fetched state directly into `window.__AUDIT_STATE__` memory before the page loads.
 * 5. The React app reads this memory state instead of making local storage or DB calls, avoiding memory quota crashes.
 */
export async function POST(request: Request) {
  try {
    const { auditId } = await request.json();
    const requestUrl = new URL(request.url);
    const originUrl = requestUrl.origin;

    if (!auditId) {
      return NextResponse.json(
        { error: "Missing auditId" },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function sendEvent(data: any) {
          controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
        }

        try {
          sendEvent({ status: "Waking up headless engine..." });
          
          let browser: any;
          if (process.env.VERCEL) {
            // Production on Vercel: Use sparticuz chromium and puppeteer-core
            const chromium = (await import("@sparticuz/chromium")).default as any;
            const puppeteerCore = await import("puppeteer-core");
            
            // Check for locally traced bin directory from outputFileTracingIncludes
            const path = await import("path");
            const fs = await import("fs");
            const localBinPath = path.join(process.cwd(), "node_modules/@sparticuz/chromium/bin");
            
            let executablePath;
            if (fs.existsSync(localBinPath)) {
              executablePath = await chromium.executablePath(localBinPath);
            } else {
              executablePath = await chromium.executablePath();
            }
            
            // Set graphics/fonts parameters to run optimally under Lambda constraints
            browser = await puppeteerCore.launch({
              args: chromium.args,
              defaultViewport: chromium.defaultViewport || null,
              executablePath,
              headless: chromium.headless,
            });
          } else {
            // Local development: Use local chromium bundled with puppeteer
            const puppeteer = await import("puppeteer");
            browser = await puppeteer.launch({
              headless: true,
              args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
          }

          const page = await browser.newPage();
          
          const pageLogs: string[] = [];
          page.on('console', (msg: any) => pageLogs.push(msg.text()));
          page.on('pageerror', (err: any) => pageLogs.push('ERROR: ' + err.message));

          // Set viewport to the exact size of our PaginatedSections (850px wide)
          await page.setViewport({
            width: 850,
            height: 1100,
            deviceScaleFactor: 2, // High DPI for crisp text, but lowered from 3 to prevent memory timeouts on 25+ page audits
          });

          // Determine base URL dynamically from request origin
          const baseUrl = originUrl;

          sendEvent({ status: "Loading document layout..." });

          // Navigate to the isolated report route with headless=true to halt recursive generation
          await page.goto(`${baseUrl}/audits/${auditId}/report?headless=true`, {
            waitUntil: "domcontentloaded", // Wait for DOM only, bypassing strict network idle checks
            timeout: 60000, 
          });

          // Ensure React has mounted and layout is stable
          await page.waitForSelector("#capture-slider", { timeout: 20000 }).catch(() => {});
          
          sendEvent({ status: "Downloading massive audit assets..." });
          await new Promise(resolve => setTimeout(resolve, 15000)); // Give a massive 15-second allowance for all external images/iframes to load

          // Calculate total pages based on horizontal scroll width
          const pageCount = await page.evaluate(() => {
            const wrapper = document.getElementById('capture-slider');
            if (!wrapper) return 1;
            return Math.ceil(wrapper.scrollWidth / 870); // 850 width + 20 gap
          });

          // CRITICAL FIX: Isolate the mask! 
          await page.evaluate((logs: string[]) => {
            const mask = document.getElementById('capture-mask');
            if (mask) {
              document.body.innerHTML = ''; 
              document.body.style.background = '#050505';
              document.body.appendChild(mask);
              mask.style.position = 'absolute';
              mask.style.top = '0px';
              mask.style.left = '0px';
            } else {
              throw new Error("Capture mask not found. Logs: " + logs.join(" | "));
            }
          }, pageLogs);

          // We must use require for jspdf in Node environments
          const { jsPDF } = require("jspdf");
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [850, 1100]
          });

          for (let i = 0; i < pageCount; i++) {
            sendEvent({ 
              status: `Generating page ${i + 1} of ${pageCount}...`,
              progress: Math.round(((i) / pageCount) * 100)
            });

            const xOffset = i * 870;

            // Slide the viewport horizontally to align the correct page under the camera
            await page.evaluate((offset: number) => {
              const slider = document.getElementById('capture-slider');
              if (slider) {
                slider.style.transform = `translateX(-${offset}px)`;
              }
            }, xOffset);

            await new Promise(resolve => setTimeout(resolve, 150)); // Wait for transform

            // Take a pixel-perfect Chromium screenshot of ONLY the isolated capture mask
            const maskHandle = await page.$('#capture-mask');
            if (!maskHandle) throw new Error("Capture mask not found");

            const screenshotBuffer = await maskHandle.screenshot({
              type: 'jpeg',
              quality: 100
            });

            const base64Image = `data:image/jpeg;base64,${Buffer.from(screenshotBuffer).toString('base64')}`;

            if (i > 0) {
              pdf.addPage([850, 1100], 'portrait');
            }

            pdf.addImage(base64Image, 'PNG', 0, 0, 850, 1100);

            // Extract raw DOM link coordinates directly from Chromium
            const linksOnPage = await page.evaluate((offset: number) => {
              const slider = document.getElementById('capture-slider');
              if (!slider) return [];
              
              const parentRect = slider.getBoundingClientRect();
              const links = Array.from(slider.querySelectorAll('a')).filter(a => a.href);
              const results: any[] = [];

              links.forEach(link => {
                const rects = Array.from(link.getClientRects());
                rects.forEach(rect => {
                  const absX = rect.left - parentRect.left;
                  const absY = rect.top - parentRect.top;
                  
                  if (absX >= offset && absX < offset + 850) {
                    results.push({
                      href: link.href,
                      internalPage: link.getAttribute('data-page'),
                      x: absX - offset,
                      y: absY,
                      width: rect.width,
                      height: rect.height
                    });
                  }
                });
              });
              return results;
            }, xOffset);

            // Inject the perfectly mapped links into the PDF
            linksOnPage.forEach((link: any) => {
              if (link.internalPage) {
                const pageNum = parseInt(link.internalPage, 10);
                pdf.link(link.x, link.y, link.width, link.height, { pageNumber: pageNum });
              } else {
                pdf.link(link.x, link.y, link.width, link.height, { url: link.href });
              }
            });
          }

          sendEvent({ 
            status: "Assembling document...",
            progress: 100 
          });

          const pdfBuffer = pdf.output('arraybuffer');
          
          await browser.close();

          // Encode the binary PDF buffer directly to a Base64 string to send inside the NDJSON
          const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');
          sendEvent({ status: "Complete", pdfBase64 });
          controller.close();
          
        } catch (error: any) {
          console.error("PDF Generation Error:", error);
          sendEvent({ error: error.message || "Internal Server Error during PDF generation" });
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Endpoint Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
