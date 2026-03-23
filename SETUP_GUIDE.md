# LexQueryia - Complete Setup Guide

This guide walks you through setting up and running the Legal Query System on your local machine.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Running the Application](#running-the-application)
5. [Testing the System](#testing-the-system)
6. [Troubleshooting](#troubleshooting)
7. [Deployment](#deployment)

---

## System Requirements

### Minimum Requirements

- **OS:** Windows 10+, macOS 10.14+, Linux (Ubuntu 18.04+)
- **RAM:** 4 GB minimum (8 GB recommended)
- **Disk Space:** 2 GB free
- **Internet:** Required for LLM API calls (Groq/Google/Anthropic)

### Required Software

- **Python:** 3.9 or higher → [Download](https://www.python.org/downloads/)
- **Node.js:** 18.0 or higher → [Download](https://nodejs.org/)
- **Git:** Any recent version → [Download](https://git-scm.com/)

### Check Installed Versions

```bash
python --version     # Should show 3.9+
node --version      # Should show 18.0+
npm --version       # Usually comes with Node.js
git --version       # Any recent version
```

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Virtual Environment

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` prefix in your terminal.

### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- FastAPI (web framework)
- Uvicorn (server)
- ChromaDB (vector store)
- Anthropic, Groq, and Google AI client libraries
- Python-dotenv (for environment variables)

**Installation may take 2-3 minutes.**

### Step 4: Get an LLM API Key

Choose **at least one** of the following:

#### Option A: Groq (RECOMMENDED - Free & Fast)

1. Go to https://console.groq.com/
2. Sign up with GitHub or Google
3. Create an API key
4. Copy the key (starts with `gsk_`)

#### Option B: Google AI Studio (Free tier available)

1. Go to https://makersuite.google.com/
2. Click "Create API Key"
3. Create new API key
4. Copy the key

#### Option C: Anthropic (Paid, high quality)

1. Go to https://console.anthropic.com/
2. Sign in or create account
3. Create an API key
4. Copy the key

### Step 5: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your API key:**
   
   **On Windows (Notepad):**
   ```bash
   notepad .env
   ```
   
   **On macOS/Linux (nano):**
   ```bash
   nano .env
   ```

3. **Update the relevant lines:**
   ```env
   # If using Groq (recommended):
   GROQ_API_KEY=your_actual_key_here

   # OR if using Google AI:
   GOOGLE_AI_API_KEY=your_actual_key_here

   # OR if using Anthropic:
   ANTHROPIC_API_KEY=your_actual_key_here
   ```

4. **Save the file** (Ctrl+S or Cmd+S)

### Step 6: Load the Legal Corpus into ChromaDB

```bash
python ingest.py
```

**Expected output:**
```
Loading corpus...
  Found 61 provisions.
Initializing ChromaDB...
  Deleted existing collection.
Ingesting documents...
  Added batch 0-20
  Added batch 20-40
  Added batch 40-61

Ingestion complete! 61 documents in collection 'indian_laws'.
ChromaDB persisted at: C:\path\to\chroma_db
```

**This creates a `chroma_db/` folder with the indexed legal provisions.**

### Step 7: Start the Backend Server

```bash
python main.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**Keep this terminal open!** The server must stay running.

---

## Frontend Setup

### Step 1: Open a New Terminal Window

Keep the backend terminal running, and open a new terminal for the frontend.

### Step 2: Navigate to Frontend Directory

```bash
cd frontend
```

(You should now be in `frontend/` directory, not `backend/`)

### Step 3: Install Node Dependencies

```bash
npm install
```

This installs React, Vite, and UI libraries.

**Installation may take 1-2 minutes.**

### Step 4: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v6.3.5  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Press q + enter to quit
```

**The frontend is now running!**

---

## Running the Application

### Prerequisites

You should have **2 terminal windows** running:

1. **Backend Terminal** (backend directory):
   ```bash
   (venv) $ python main.py
   # Shows: Uvicorn running on http://0.0.0.0:8000
   ```

2. **Frontend Terminal** (frontend directory):
   ```bash
   $ npm run dev
   # Shows: Local: http://localhost:5173/
   ```

### Access the Application

1. Open your web browser
2. Go to: **http://localhost:5173/**
3. You should see the LexQueryia interface

### Using LexQueryia

1. **Create a New Session:**
   - Click "New Legal Query" on the dashboard

2. **Ask a Legal Question:**
   - Type a question in the chat box
   - Example: "What is the punishment for theft?"
   - Press Enter or click Send

3. **View Citations:**
   - The AI will respond with citations
   - Click on a citation card to expand and see the full clause text

4. **Continue Conversation:**
   - Ask follow-up questions for more clarification
   - Session history is maintained

5. **Mark Query as Solved:**
   - When done, click "Mark as Solved"
   - Return to dashboard to see query history

---

## Testing the System

### Test 1: Health Check

```bash
# In a new terminal, verify the backend is running
curl http://localhost:8000/health
```

**Expected response:**
```json
{"status": "healthy"}
```

### Test 2: API Query

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is murder under IPC?"}'
```

**Expected response:** JSON with `answer`, `citations`, and `disclaimer`

### Test 3: Example Queries

Try these legal questions to test the system:

1. **Criminal Law:**
   - "What is Section 302 of the IPC?"
   - "What is the punishment for rape?"
   - "What is dowry death?"

2. **Consumer Protection:**
   - "What are consumer rights?"
   - "How do I file a consumer complaint?"

3. **Labor Law:**
   - "What is the Factories Act?"
   - "What is gratuity?"

4. **RTI:**
   - "What is Right to Information?"
   - "What can I ask in an RTI application?"

---

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'fastapi'"

**Solution:**
```bash
# Make sure you're in the backend directory
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Issue: "GROQ_API_KEY not found" or LLM errors

**Solution:**
1. Verify `.env` file exists in `backend/` directory
2. Check that you added the API key correctly (no extra spaces)
3. Test the API key at the provider's website
4. Try a different LLM provider (system will auto-fallback)

### Issue: "Connection refused" or "Cannot reach localhost:8000"

**Solution:**
1. Ensure backend server is running: `python main.py`
2. Check that backend is running on `http://localhost:8000`
3. Try: `curl http://localhost:8000/health`
4. If still failing, restart the backend server

### Issue: Frontend shows "Cannot load http://localhost:8000/api/query"

**Solution:**
1. Ensure backend server is running (check terminal)
2. Verify CORS is enabled in `backend/main.py` (it should be by default)
3. Check browser console for exact error (F12 → Console tab)
4. Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Issue: "ChromaDB connection error"

**Solution:**
```bash
# The chroma_db/ folder should exist after running ingest.py
# If not:
python ingest.py

# Or delete the chroma_db folder and re-ingest:
rm -r chroma_db  # macOS/Linux
rmdir /s chroma_db  # Windows
python ingest.py
```

### Issue: "Port 8000 or 5173 is already in use"

**Solution:**
```bash
# For port 8000 (Backend)
# Change in backend/.env:
PORT=8001

# For port 5173 (Frontend)
# The app will auto-increment to 5174, 5175, etc.
# Or change in frontend/vite.config.js:
export default {
  server: {
    port: 5174
  }
}
```

### Issue: "npm: command not found"

**Solution:**
- Node.js/npm not installed or not in PATH
- Download from https://nodejs.org/
- Restart terminal after installation

---

## Deployment

### For Production

⚠️ **NEVER commit `.env` with real API keys!**

1. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   # Creates frontend/dist/ folder
   ```

2. **Set up environment on production server:**
   - Create `.env` file with production API keys
   - Ensure it's in `.gitignore`

3. **Run backend:**
   ```bash
   cd backend
   python main.py
   ```

4. **Serve frontend (optional):**
   - Upload `frontend/dist/` to a web server
   - Or serve from the backend as static files

### Using Docker (Optional)

Create a `Dockerfile` in the root directory:

```dockerfile
FROM python:3.11

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .

CMD ["python", "main.py"]
```

Build and run:
```bash
docker build -t lexqueryia .
docker run -e GROQ_API_KEY=your_key -p 8000:8000 lexqueryia
```

---

## Next Steps

1. ✅ Backend running on `http://localhost:8000`
2. ✅ Frontend running on `http://localhost:5173`
3. ✅ Legal corpus loaded (61 provisions)
4. ✅ API working with multi-LLM support
5. ✅ UI with session management ready

### To Improve the System

- Add more law provisions to `backend/corpus/indian_laws.json`
- Integrate with India Code API (indiacode.nic.in)
- Add PDF document upload for custom corpus
- Implement case law search
- Add re-ranking model for better precision

---

## Support

- 📧 Issues? Check the [main README.md](README.md)
- 🐛 Found a bug? Open an issue on GitHub
- 💬 Questions? Check the documentation folder
- ⚖️ Legal questions? Consult a professional!

---

**Happy Legal Querying! ⚖️**

For more details, see `README.md` in the project root.
