import fitz  # PyMuPDF
import sys
import os
import json

def extract_pdf_text(pdf_path):
    text = f"--- START OF DOCUMENT: {os.path.basename(pdf_path)} ---\n"
    try:
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc[page_num]
            text += page.get_text("text") + "\n"
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
    text += f"--- END OF DOCUMENT: {os.path.basename(pdf_path)} ---\n\n"
    return text

if __name__ == "__main__":
    base_dir = "c:/Audit-Strategy-Template/Old-audits"
    files = [
        "QALO-SEM-Audit-V1.pdf",
        "intoxalock.com-Competitor-Audit-Report.pdf",
        "McKenzieTaxidermy-SEO-Audit-Report.pdf",
        "Valtir Rentals CRO SEO Audit.pdf"
    ]
    
    combined_text = ""
    for f in files:
        full_path = os.path.join(base_dir, f)
        print(f"Extracting {f}...")
        combined_text += extract_pdf_text(full_path)
        
    out_dir = "c:/Audit-Strategy-Template/scratch"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "new_audits_text.txt")
    
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(combined_text)
        
    print(f"Extraction complete! Saved to {out_path}")
