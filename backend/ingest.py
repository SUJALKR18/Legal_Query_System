"""
Ingestion script — loads the curated Indian law corpus into ChromaDB.
Run this once before starting the server:
    cd backend && python ingest.py
"""

import json
import os
import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv

load_dotenv()

CORPUS_PATH = os.path.join(os.path.dirname(__file__), "corpus", "indian_laws.json")
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
COLLECTION_NAME = "indian_laws"


def load_corpus(path: str) -> list[dict]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def build_document_text(entry: dict) -> str:
    """Build a rich text string for embedding that captures all metadata."""
    parts = [
        f"Act: {entry['act_name']}",
        f"Chapter: {entry.get('chapter', 'N/A')}",
        f"{entry['section']} — {entry['title']}",
        entry["text"],
    ]
    return "\n".join(parts)


def ingest():
    print("Loading corpus...")
    corpus = load_corpus(CORPUS_PATH)
    print(f"  Found {len(corpus)} provisions.")

    print("Initializing ChromaDB...")
    client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)

    # Use sentence-transformers for embeddings
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )

    # Delete existing collection if it exists (fresh rebuild)
    try:
        client.delete_collection(name=COLLECTION_NAME)
        print("  Deleted existing collection.")
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=ef,
        metadata={"hnsw:space": "cosine"},
    )

    print("Ingesting documents...")
    documents = []
    metadatas = []
    ids = []

    for i, entry in enumerate(corpus):
        doc_text = build_document_text(entry)
        documents.append(doc_text)
        metadatas.append({
            "act_name": entry["act_name"],
            "section": entry["section"],
            "title": entry["title"],
            "chapter": entry.get("chapter", ""),
            "text": entry["text"],
        })
        ids.append(f"law_{i:04d}")

    # Add in batches (ChromaDB handles embedding automatically)
    batch_size = 20
    for start in range(0, len(documents), batch_size):
        end = min(start + batch_size, len(documents))
        collection.add(
            documents=documents[start:end],
            metadatas=metadatas[start:end],
            ids=ids[start:end],
        )
        print(f"  Added batch {start}-{end}")

    print(f"\nIngestion complete! {collection.count()} documents in collection '{COLLECTION_NAME}'.")
    print(f"ChromaDB persisted at: {os.path.abspath(CHROMA_PERSIST_DIR)}")


if __name__ == "__main__":
    ingest()
