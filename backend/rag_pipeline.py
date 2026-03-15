"""
RAG Pipeline — retrieves relevant legal sections from ChromaDB and generates
grounded answers using Groq (primary), Google AI, Anthropic, or local fallback.
"""

import os
import chromadb
import requests
from chromadb.utils import embedding_functions
from anthropic import Anthropic
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
COLLECTION_NAME = "indian_laws"

# Anthropic (Claude)
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# Google AI Studio
GOOGLE_AI_MODEL = os.getenv("GOOGLE_AI_MODEL", "gemini-2.0-flash")
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY", "")

# Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Number of chunks to retrieve
TOP_K = 5

# Clients
_chroma_client = None
_collection = None
_anthropic_client = None
_groq_client = None


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


def _get_groq():
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=GROQ_API_KEY)
    return _groq_client


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
                "relevance_score": 1 - results["distances"][0][i],
            })

    return sections


def build_prompt(query: str, sections: list[dict]) -> str:
    """Build the prompt with retrieved context and citation instructions."""
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
    """Generate a simple grounded answer without calling an external LLM."""
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


def _generate_answer_groq(query: str, sections: list[dict]) -> str:
    """Generate an answer using Groq (primary LLM)."""
    if not GROQ_API_KEY:
        raise ValueError("Groq API key not configured")

    client = _get_groq()
    prompt = build_prompt(query, sections)

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are LexQueryia, an AI legal assistant for Indian law. Always cite exact Act names, Section numbers, and clause text. Never fabricate legal provisions."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_tokens=2048,
    )

    return response.choices[0].message.content


def _generate_answer_google(query: str, sections: list[dict]) -> str:
    """Generate an answer using Google AI Studio Gemini."""
    if not GOOGLE_AI_API_KEY:
        raise ValueError("Google AI API key not configured")

    prompt = build_prompt(query, sections)

    url = f"https://generativelanguage.googleapis.com/v1/models/{GOOGLE_AI_MODEL}:generateContent"

    params = {"key": GOOGLE_AI_API_KEY}
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 1024,
        }
    }

    resp = requests.post(url, params=params, json=payload, timeout=30)
    try:
        resp.raise_for_status()
    except Exception as e:
        print(
            "Google AI Studio request failed:",
            resp.status_code,
            resp.text,
            "(url=", url, ")",
        )
        raise

    parsed = resp.json()
    return parsed["candidates"][0]["content"]["parts"][0]["text"]


def _generate_answer_anthropic(query: str, sections: list[dict]) -> str:
    """Generate an answer using Anthropic Claude."""
    if not ANTHROPIC_API_KEY:
        raise ValueError("Anthropic API key not configured")

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


def generate_answer(query: str, sections: list[dict]) -> str:
    """Generate an answer using the configured LLM provider, with a local fallback."""

    # 1. Try Groq (free and fast)
    if GROQ_API_KEY:
        try:
            return _generate_answer_groq(query, sections)
        except Exception as e:
            print(f"Groq call failed: {e}. Trying Google AI.")

    # 2. Try Google AI
    if GOOGLE_AI_API_KEY:
        try:
            return _generate_answer_google(query, sections)
        except Exception as e:
            print(f"Google AI call failed: {e}. Trying Anthropic.")

    # 3. Try Anthropic
    if ANTHROPIC_API_KEY:
        try:
            return _generate_answer_anthropic(query, sections)
        except Exception as e:
            print(f"Anthropic call failed: {e}. Falling back to local.")

    # 4. Local fallback
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

    # Step 2: Generate answer
    answer = generate_answer(query, sections)

    # Step 3: Build citations
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