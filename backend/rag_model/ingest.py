"""
PDF Ingestion & Chunking Pipeline for Legal Documents.
Parses PDFs, extracts text, chunks by sections, and stores in ChromaDB.
"""

import os
import re
import json
import sys
import PyPDF2
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_PDFS_DIR = DATA_DIR / "raw_pdfs"
EXTRACTED_TEXT_DIR = DATA_DIR / "extracted_text"
CHUNKS_DIR = DATA_DIR / "chunks"
VECTOR_DB_DIR = DATA_DIR / "vector_db"

# Ensure directories exist
for d in [EXTRACTED_TEXT_DIR, CHUNKS_DIR, VECTOR_DB_DIR]:
    d.mkdir(parents=True, exist_ok=True)


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract full text from a PDF file."""
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ""
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text += f"\n----- PAGE {i+1} -----\n"
                text += page_text
    return text


def detect_act_name(text: str) -> str:
    """Try to detect the act name from the beginning of the text."""
    patterns = [
        r'THE\s+(.+?ACT,?\s*\d{4})',
        r'(.+?ACT,?\s*\d{4})',
    ]
    for pattern in patterns:
        match = re.search(pattern, text[:2000], re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            name = re.sub(r'\s+', ' ', name)
            return name
    return "Unknown Act"


def detect_year(text: str) -> str:
    """Try to detect the year from the act name."""
    match = re.search(r'(\d{4})', text[:2000])
    return match.group(1) if match else "Unknown"


def chunk_legal_text(text: str, source_file: str) -> list:
    """
    Chunk legal text by sections and chapters.
    Each chunk contains metadata about act, chapter, section.
    """
    act_name = detect_act_name(text)
    year = detect_year(text)
    
    chunks = []
    current_chapter = "Preliminary"
    
    # Split by section pattern: number followed by period and title
    # Pattern matches "1. Short title..." or "33A. Penalty for..."
    section_pattern = re.compile(
        r'(?:^|\n)\s*(\d+[A-Z]?)\.\s+([^\n—.]+?)[\s—.]+',
        re.MULTILINE
    )
    
    # Find all sections
    matches = list(section_pattern.finditer(text))
    
    if not matches:
        # If no sections found, chunk by fixed size
        words = text.split()
        chunk_size = 500
        for i in range(0, len(words), chunk_size):
            chunk_text = ' '.join(words[i:i + chunk_size])
            chunks.append({
                "metadata": {
                    "act_name": act_name,
                    "year": year,
                    "source_file": source_file,
                    "chapter": current_chapter,
                    "section": "",
                    "section_title": "General"
                },
                "text": chunk_text
            })
        return chunks
    
    # Process text before first section
    preamble = text[:matches[0].start()].strip()
    if preamble and len(preamble) > 50:
        # Check for chapter info in preamble
        chapter_match = re.search(r'CHAPTER\s+([IVXLC]+[A-Z]*)\s*[\n\r]+\s*(.+?)(?:\n|$)', preamble)
        if chapter_match:
            current_chapter = f"CHAPTER {chapter_match.group(1)} - {chapter_match.group(2).strip()}"
        
        chunks.append({
            "metadata": {
                "act_name": act_name,
                "year": year,
                "source_file": source_file,
                "chapter": current_chapter,
                "section": "",
                "section_title": "Preamble"
            },
            "text": preamble[:2000]
        })
    
    # Process each section
    for i, match in enumerate(matches):
        section_num = match.group(1)
        section_title = match.group(2).strip()
        
        # Get section text (from this match to next match or end)
        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        section_text = text[start:end].strip()
        
        # Skip very short sections (likely Table of Contents entries)
        if len(section_text) < 70:
            continue
        
        # Check for chapter headers within section text
        chapter_match = re.search(r'CHAPTER\s+([IVXLC]+[A-Z]*)\s*[\n\r]+\s*(.+?)(?:\n|$)', section_text)
        if chapter_match:
            current_chapter = f"CHAPTER {chapter_match.group(1)} - {chapter_match.group(2).strip()}"
        
        # Split large sections into parts
        if len(section_text) > 2000:
            words = section_text.split()
            part = 1
            for j in range(0, len(words), 400):
                chunk_text = ' '.join(words[j:j + 400])
                chunks.append({
                    "metadata": {
                        "act_name": act_name,
                        "year": year,
                        "source_file": source_file,
                        "chapter": current_chapter,
                        "section": section_num,
                        "section_title": section_title,
                        "part": part
                    },
                    "text": chunk_text
                })
                part += 1
        else:
            chunks.append({
                "metadata": {
                    "act_name": act_name,
                    "year": year,
                    "source_file": source_file,
                    "chapter": current_chapter,
                    "section": section_num,
                    "section_title": section_title
                },
                "text": section_text
            })
    
    return chunks


def save_chunks_jsonl(chunks: list, output_path: str):
    """Save chunks as JSONL file."""
    with open(output_path, 'w', encoding='utf-8') as f:
        for chunk in chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + '\n')


def build_vector_store(chunks_dir: str, vector_db_dir: str):
    """Build ChromaDB vector store from all chunk files."""
    from chromadb import PersistentClient
    from sentence_transformers import SentenceTransformer
    
    print("Loading embedding model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Initialize ChromaDB
    client = PersistentClient(path=str(vector_db_dir))
    
    # Delete existing collection if it exists
    try:
        client.delete_collection("legal_docs")
    except Exception:
        pass
    
    collection = client.create_collection(
        name="legal_docs",
        metadata={"hnsw:space": "cosine"}
    )
    
    all_texts = []
    all_metadatas = []
    all_ids = []
    
    chunk_files = list(Path(chunks_dir).glob("*.jsonl"))
    print(f"Found {len(chunk_files)} chunk file(s)")
    
    for chunk_file in chunk_files:
        with open(chunk_file, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f):
                if not line.strip():
                    continue
                data = json.loads(line)
                text = data['text']
                metadata = data['metadata']
                
                # Flatten metadata for ChromaDB (only string values)
                flat_metadata = {}
                for k, v in metadata.items():
                    if isinstance(v, (str, int, float, bool)):
                        flat_metadata[k] = str(v)
                
                doc_id = f"{chunk_file.stem}_{line_num}"
                all_texts.append(text)
                all_metadatas.append(flat_metadata)
                all_ids.append(doc_id)
    
    if not all_texts:
        print("No chunks found to index!")
        return
    
    print(f"Embedding {len(all_texts)} chunks...")
    embeddings = model.encode(all_texts, show_progress_bar=True, batch_size=32)
    
    # Add to ChromaDB in batches
    batch_size = 100
    for i in range(0, len(all_texts), batch_size):
        end = min(i + batch_size, len(all_texts))
        collection.add(
            documents=all_texts[i:end],
            metadatas=all_metadatas[i:end],
            ids=all_ids[i:end],
            embeddings=embeddings[i:end].tolist()
        )
    
    print(f"Successfully indexed {len(all_texts)} chunks into ChromaDB")


def ingest_all():
    """Full ingestion pipeline: PDF -> Text -> Chunks -> Vector Store."""
    pdf_files = list(RAW_PDFS_DIR.glob("*.pdf"))
    
    if not pdf_files:
        print("No PDF files found in data/raw_pdfs/")
        return
    
    print(f"Found {len(pdf_files)} PDF file(s)")
    
    for pdf_path in pdf_files:
        stem = pdf_path.stem
        print(f"\n--- Processing: {pdf_path.name} ---")
        
        # Step 1: Extract text
        txt_path = EXTRACTED_TEXT_DIR / f"{stem}.txt"
        if not txt_path.exists():
            print(f"  Extracting text...")
            text = extract_text_from_pdf(str(pdf_path))
            with open(txt_path, 'w', encoding='utf-8') as f:
                f.write(text)
            print(f"  Saved to {txt_path.name}")
        else:
            print(f"  Text already extracted: {txt_path.name}")
            with open(txt_path, 'r', encoding='utf-8') as f:
                text = f.read()
        
        # Step 2: Chunk text
        chunks_path = CHUNKS_DIR / f"{stem}_chunks.jsonl"
        print(f"  Chunking text...")
        chunks = chunk_legal_text(text, f"{stem}.txt")
        save_chunks_jsonl(chunks, str(chunks_path))
        print(f"  Created {len(chunks)} chunks -> {chunks_path.name}")
    
    # Step 3: Build vector store
    print(f"\n--- Building Vector Store ---")
    build_vector_store(str(CHUNKS_DIR), str(VECTOR_DB_DIR))
    print("Done!")


if __name__ == "__main__":
    ingest_all()
