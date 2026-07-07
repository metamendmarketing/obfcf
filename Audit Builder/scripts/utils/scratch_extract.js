const fs = require('fs');
const xml = fs.readFileSync('c:/Audit-Strategy-Template/Old-audits/FW__Everest_Formulations_Aduit/docx_extracted/word/document.xml', 'utf8');
const paragraphs = xml.split('</w:p>');
paragraphs.forEach(p => {
  const match = p.match(/r:embed="([^"]+)"/);
  if (match) {
    console.log('IMAGE: ' + match[1]);
  }
  const text = p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text) console.log('TEXT: ' + text.substring(0, 100));
});
