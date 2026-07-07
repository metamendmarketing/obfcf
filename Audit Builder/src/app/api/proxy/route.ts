import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    let response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
    } catch (e: any) {
      // Auto-retry with 'www.' if there's a TLS cert mismatch or DNS issue on the root domain
      if (!url.includes('www.')) {
        const urlObj = new URL(url);
        urlObj.hostname = `www.${urlObj.hostname}`;
        response = await fetch(urlObj.toString(), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        });
      } else {
        throw e;
      }
    }

    if (!response.ok) {
      return new NextResponse(
        `<div style="font-family:sans-serif;padding:2rem;text-align:center;color:#666;">
           <h2>Website Unavailable</h2>
           <p>The target website returned a ${response.status} error.</p>
         </div>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    const body = await response.text();

    let modifiedBody = body;
    if (contentType.includes('text/html')) {
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.protocol}//${urlObj.host}/`;
      
      if (modifiedBody.match(/<head[^>]*>/i)) {
        modifiedBody = modifiedBody.replace(/(<head[^>]*>)/i, `$1<base href="${baseUrl}">`);
      } else {
        modifiedBody = `<base href="${baseUrl}">\n${modifiedBody}`;
      }
    }

    return new NextResponse(modifiedBody, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Proxy Error:', error);
    return new NextResponse(
      `<div style="font-family:sans-serif;padding:2rem;text-align:center;color:#666;">
         <h2>Website Offline or Unreachable</h2>
         <p>We could not load <strong>${url}</strong>.</p>
         <p style="font-size:0.9em;color:#999;">${error.message}</p>
       </div>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
