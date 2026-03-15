"""
RAG Pipeline — retrieves relevant legal sections from ChromaDB and generates
grounded answers using Claude via the Anthropic API.
"""

import os
import chromadb
import requests
from chromadb.utils import embedding_functions
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
COLLECTION_NAME = "indian_laws"

# Anthropic (Claude)
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# Google AI Studio / Vertex AI
GOOGLE_AI_MODEL = os.getenv("GOOGLE_AI_MODEL", "text-bison-001")
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY", "")

# Number of chunks to retrieve
TOP_K = 5

# Initialize ChromaDB client and embedding function
_chroma_client = None
_collection = None
_anthropic_client = None


def _get_collection():
    global _chroma_client, _collection
    if _collection is None:
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        ef = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        _collection = _chroma_client.get_collection(
            name=COLLECTION_NAME,
            embedding_function=ef,
        )
    return _collection


def _get_anthropic():
    global _anthropic_client
    if _anthropic_client is None:
        _anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY)
    return _anthropic_client


def retrieve_relevant_sections(query: str, top_k: int = TOP_K) -> list[dict]:
    """Query ChromaDB for the most relevant legal sections."""
    collection = _get_collection()

    results = collection.query(
        query_texts=[query],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    sections = []
    if results and results["metadatas"] and results["metadatas"][0]:
        for i, metadata in enumerate(results["metadatas"][0]):
            sections.append({
                "act_name": metadata["act_name"],
                "section": metadata["section"],
                "title": metadata["title"],
                "chapter": metadata.get("chapter", ""),
                "text": metadata["text"],
                "relevance_score": 1 - results["distances"][0][i],  # cosine similarity
            })

    return sections


def build_prompt(query: str, sections: list[dict]) -> str:
    """Build the Claude prompt with retrieved context and citation instructions."""
    context_parts = []
    for i, s in enumerate(sections, 1):
        context_parts.append(
            f"[{i}] {s['act_name']} — {s['section']}: {s['title']}\n"
            f"Chapter: {s['chapter']}\n"
            f"Full Text: {s['text']}\n"
        )

    context_block = "\n---\n".join(context_parts)

    prompt = f"""You are LexQueryia, an expert AI legal assistant specializing in Indian law. You provide precise, well-structured answers to legal queries by citing exact statutory provisions.

RETRIEVED LEGAL PROVISIONS:
{context_block}

USER QUERY: {query}

INSTRUCTIONS:
1. Answer the user's legal query based ONLY on the retrieved legal provisions above.
2. For every legal point you make, cite the exact Act name, Section number, and quote the relevant clause text verbatim.
3. Structure your answer clearly with proper formatting (use markdown).
4. If the retrieved provisions do not fully address the query, acknowledge the limitation.
5. Use a professional but accessible tone — the user may not be a legal expert.
6. End your response with a brief note that this is AI-generated information and professional legal counsel should be sought for specific situations.
7. Do NOT make up or hallucinate any legal provisions that are not in the retrieved context above.

Provide your answer now:"""

    return prompt


def generate_answer_local(query: str, sections: list[dict]) -> str:
    """Generate a simple grounded answer without calling an external LLM.

    This is a free fallback when an LLM API key is not available or when API calls fail.
    It presents the retrieved statutes and guidance on how they relate to the user's query.
    """
    lines = [
        "Based on the retrieved legal provisions below, the following sections may be relevant to your question:",
        "",
    ]

    for i, s in enumerate(sections, 1):
        lines.append(f"{i}. **{s['act_name']}**, Section **{s['section']}** - {s['title']}")
        lines.append('> ' + s['text'].replace('\n', '\n> '))
        lines.append("")

    lines.append(
        "Please review these provisions carefully and consult a qualified legal professional for specific advice, as this system does not provide legal counsel."
    )

    return "\n".join(lines)


def _generate_answer_google(query: str, sections: list[dict]) -> str:
    """Generate an answer using Google AI Studio / Vertex AI Text Generation."""
    if not GOOGLE_AI_API_KEY:
        raise ValueError("Google AI API key not configured")

    prompt = build_prompt(query, sections)
    url = f"https://generativelanguage.googleapis.com/v1beta2/models/{GOOGLE_AI_MODEL}:generateText"
    params = {"key": GOOGLE_AI_API_KEY}
    payload = {
        "prompt": {"text": prompt},
        "temperature": 0.2,
        "maxOutputTokens": 1024,
    }

    resp = requests.post(url, params=params, json=payload, timeout=30)
    resp.raise_for_status()

    parsed = resp.json()
    # Google returns a list of candidates; take the first one.
    return parsed.get("candidates", [])[0].get("output", "")


def generate_answer(query: str, sections: list[dict]) -> str:
    """Generate an answer using the configured LLM provider, with a local fallback."""
    # Prefer Google AI if configured
    if GOOGLE_AI_API_KEY:
        try:
            return _generate_answer_google(query, sections)
        except Exception as e:
            print(f"Google AI Studio call failed: {e}. Trying Anthropic (if configured) or falling back to local answer.")

    # Otherwise try Anthropic (Claude)
    if ANTHROPIC_API_KEY:
        try:
            client = _get_anthropic()
            prompt = build_prompt(query, sections)

            response = client.messages.create(
                model=CLAUDE_MODEL,
                max_tokens=2048,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                system="You are LexQueryia, an AI legal assistant for Indian law. Always cite exact Act names, Section numbers, and clause text. Never fabricate legal provisions.",
            )

            return response.content[0].text
        except Exception as e:
            print(f"Anthropic call failed: {e}. Falling back to local answer generation.")

    # Last resort: local (deterministic) response
    return generate_answer_local(query, sections)


def query_legal_rag(query: str) -> dict:
    """
    Main RAG pipeline entry point.
    Returns: { "answer": str, "citations": list[dict] }
    """
    # Step 1: Retrieve relevant sections
    sections = retrieve_relevant_sections(query, top_k=TOP_K)

    if not sections:
        return {
            "answer": "I could not find any relevant legal provisions for your query in the current corpus. Please try rephrasing your question or consult a legal professional.",
            "citations": [],
        }

    # Step 2: Generate answer using Claude
    answer = generate_answer(query, sections)

    # Step 3: Build citations from retrieved sections
    citations = [
        {
            "act_name": s["act_name"],
            "section": s["section"],
            "title": s["title"],
            "text": s["text"],
        }
        for s in sections
    ]

    return {
        "answer": answer,
        "citations": citations,
    }
