# 🌌 Semantic World Explorer.........

> **Google Maps for Ideas.** An AI-powered semantic exploration platform where you navigate knowledge as a living, interactive universe — not a chatbot.

Built for the **Qdrant "Think Outside the Bot" Hackathon 2026**.

---
## 🎥 Demo Video

Watch the full project demo here:

[![Watch the Demo](https://img.youtube.com/vi/_QQlBwxgfwE/maxresdefault.jpg)](https://youtu.be/_QQlBwxgfwE)

Direct Link:
https://youtu.be/_QQlBwxgfwE


## ✨ What is this?

Semantic World Explorer transforms any dataset into an **interactive semantic graph world**. Upload your research papers, startup ideas, notes, or any text data — and watch it become a navigable knowledge universe with:

- **Glowing, force-directed nodes** that repel and attract based on semantic similarity
- **AI-generated insights** explaining why concepts connect
- **Semantic search** that finds ideas by meaning, not keywords
- **Cluster discovery** — automatically grouped by topic using KMeans on embedding space
- **Hidden connection explorer** — surface unexpected relationships across domains

---

## 🏗️ Architecture

```
semantic-world-explorer/
├── frontend/                    # Next.js 15 + React 19
│   └── src/
│       ├── app/                 # App Router pages
│       │   ├── page.tsx         # Landing page
│       │   └── explore/         # Main graph explorer
│       ├── components/
│       │   ├── graph/           # Force-directed graph visualization
│       │   ├── panels/          # Node detail side panel
│       │   └── ui/              # Search, upload, toolbar, legend
│       ├── hooks/               # useGraph, useNodeDetail, useSearch
│       ├── services/            # API client
│       └── types/               # TypeScript interfaces
│
├── backend/                     # FastAPI + Python 3.12
│   ├── api/                     # Route handlers
│   ├── services/                # Graph building, AI insights
│   ├── models/                  # Pydantic schemas
│   ├── embeddings/              # Modular embedding provider (Gemini)
│   ├── qdrant_client/           # Qdrant service wrapper
│   └── utils/                   # File parser, demo data
│
├── docker-compose.yml
└── scripts/setup.sh
```

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone and enter
git clone <repo>
cd semantic-world-explorer

# Copy env (add your Gemini API key, optional)
cp backend/.env.example backend/.env

# Launch everything
docker compose up
```

Open **http://localhost:3000** — the app loads with 30 demo nodes pre-seeded.

---

### Option 2: Local Development

**Prerequisites:** Node 20+, Python 3.12+, Docker (for Qdrant)

```bash
# Run setup script
bash scripts/setup.sh

# Terminal 1: Qdrant
docker run -p 6333:6333 qdrant/qdrant

# Terminal 2: Backend
cd backend
source .venv/bin/activate
uvicorn main:app --reload

# Terminal 3: Frontend
cd frontend
npm run dev
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | *(empty)* | Google Gemini API key. App runs in **demo mode** without it (deterministic mock embeddings). |
| `QDRANT_HOST` | `localhost` | Qdrant server host |
| `QDRANT_PORT` | `6333` | Qdrant server port |
| `QDRANT_API_KEY` | *(empty)* | Optional Qdrant Cloud API key |
| `COLLECTION_NAME` | `semantic_world` | Qdrant collection name |
| `EMBEDDING_DIMENSION` | `768` | Vector dimension (matches Gemini `text-embedding-004`) |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## 🧠 How Qdrant Powers Everything

Qdrant is the **core engine** of Semantic World Explorer:

### 1. Vector Storage
Every uploaded node is embedded using Gemini's `text-embedding-004` model (768 dimensions) and stored in Qdrant with rich metadata payload.

### 2. Graph Generation
The `/api/graph` endpoint fetches all vectors, computes a **cosine similarity matrix**, and extracts top-K connections per node above a threshold — turning Qdrant's vector space into a navigable graph.

### 3. Semantic Search
Search queries are embedded in real-time and passed to Qdrant's `search` endpoint with `score_threshold` filtering — returning semantically similar nodes regardless of keyword overlap.

### 4. Node Similarity
"Related Nodes" in the detail panel are powered by Qdrant's nearest-neighbor retrieval on the clicked node's stored vector.

### 5. Clustering
KMeans clustering runs on the retrieved embedding matrix to auto-assign color-coded domain clusters.

```python
# Example: semantic similarity search
results = qdrant_client.search(
    collection_name="semantic_world",
    query_vector=embedding,
    limit=10,
    score_threshold=0.4,
    with_payload=True
)
```

---

## 📡 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/upload` | POST | Upload TXT/JSON/CSV, embed, store in Qdrant |
| `/api/graph` | GET | Get full graph (nodes + similarity links) |
| `/api/node/{id}` | GET | Node details + similar nodes + AI insight |
| `/api/similar/{id}` | GET | Top-N similar nodes |
| `/api/search` | POST | Semantic search query |
| `/api/stats` | GET | Collection stats |
| `/api/explain-connection` | POST | AI explanation of two nodes' connection |
| `/health` | GET | Health check |

---

## 📁 Supported Upload Formats

### TXT
Plain text file. Paragraphs (double newline-separated) become nodes.

### JSON
Array of objects:
```json
[
  { "title": "My Idea", "content": "Description...", "category": "AI", "tags": ["ml"] }
]
```

### CSV
Columns: `title`, `content`, `category`, `tags` (comma-separated in cell).

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | TailwindCSS, Framer Motion |
| Graph | react-force-graph-2d |
| Backend | FastAPI, Python 3.12, Uvicorn |
| Validation | Pydantic v2 |
| Vector DB | **Qdrant** |
| Embeddings | Google Gemini `text-embedding-004` |
| Clustering | scikit-learn KMeans |
| Containers | Docker, Docker Compose |

---

## 🌟 Demo Data

The app auto-seeds **30 curated nodes** across 8 domains on first startup:

- 🤖 **AI** — LLMs, Transformers, RLHF, RAG, Agents, Vector DBs
- 💰 **Fintech** — DeFi, Embedded Finance, Open Banking, Fraud Detection
- 🌱 **Climate** — Carbon Capture, Green Hydrogen, Ocean Energy, Solid-State Batteries
- 🌾 **Agriculture** — Vertical Farming, Precision Agriculture
- 🤖 **Robotics** — Humanoid Robots, Swarm Robotics, Autonomous Vehicles
- 💻 **Computing** — Quantum Computing, Neuromorphic Chips
- 🏥 **HealthTech** — AI Drug Discovery, BCIs, Synthetic Biology, Digital Therapeutics
- 🚀 **SpaceTech** — Satellite Constellations, Space Manufacturing

---

*Made for the Qdrant Hackathon 2026*
