import PyPDF2
import sys

def extract_text(pdf_path, txt_path):
    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for i, page in enumerate(reader.pages):
                text += f"----- PAGE {i+1} -----\n"
                text += page.extract_text() + "\n"
        
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write(text)
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_text("DIP_Problem_statements_6th_sem.pdf", "pdf_dump.txt")
