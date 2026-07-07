import fitz

def extract_pdf(pdf_path, out_path):
    doc = fitz.open(pdf_path)
    full_text = ""
    for page_num in range(len(doc)):
        page = doc[page_num]
        full_text += f"\n\n--- PAGE {page_num + 1} ---\n\n"
        full_text += page.get_text("text")
        
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(full_text)
    print(f"Extracted to {out_path}")

if __name__ == "__main__":
    extract_pdf("McKenzieTaxidermy-SEO-Audit-Report.pdf", "artifacts/extracted_mckenzie.txt")
    extract_pdf("intoxalock.com-Competitor-Audit-Report.pdf", "artifacts/extracted_intoxalock.txt")
