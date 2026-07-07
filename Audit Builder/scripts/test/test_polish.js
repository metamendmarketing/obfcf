const fetch = require('node-fetch');

async function test() {
  const res = await fetch('http://localhost:3000/api/ai/polish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rawNotes: "The banner image on the homepage is missing an alt tag. This is bad for SEO because Google cannot read the image.",
      category: "Technical SEO",
      stage: "Discovery",
      wordLimit: 100
    })
  });
  const data = await res.json();
  console.log(data);
}

test();
