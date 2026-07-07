const http = require('http');

const data = JSON.stringify({
  auditId: 'some-id',
  storeState: {
    audits: {},
    findings: {},
    pageTemplates: {},
    users: {},
    currentUser: null
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/audits/api/generate-pdf',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log("Sending POST request to generate-pdf API...");

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log("Response Body (first 500 chars):", body.slice(0, 500));
  });
});

req.on('error', (error) => {
  console.error("HTTP Request Error:", error);
});

req.write(data);
req.end();
