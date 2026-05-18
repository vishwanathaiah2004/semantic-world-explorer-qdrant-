#!/usr/bin/env bash
set -e

echo ""
echo "🌌 Semantic World Explorer — Setup"
echo "=================================="
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org"
  exit 1
fi
echo "✅ Node $(node -v)"

# Check Python
if ! command -v python3 &> /dev/null; then
  echo "❌ Python 3 not found."
  exit 1
fi
echo "✅ Python $(python3 --version)"

# Check Docker
if command -v docker &> /dev/null; then
  echo "✅ Docker found"
  DOCKER_OK=true
else
  echo "⚠️  Docker not found (optional for local dev)"
  DOCKER_OK=false
fi

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend && npm install
cd ..

echo ""
echo "📦 Installing backend dependencies..."
cd backend
python3 -m venv .venv 2>/dev/null || true
source .venv/bin/activate 2>/dev/null || true
pip install -r requirements.txt -q
cd ..

echo ""
echo "🔑 Setting up environment files..."
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "   Created backend/.env — add your GEMINI_API_KEY (optional, runs in demo mode without it)"
fi
if [ ! -f frontend/.env.local ]; then
  cp frontend/.env.example frontend/.env.local
  echo "   Created frontend/.env.local"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "  1. Start Qdrant:"
echo "     docker run -p 6333:6333 qdrant/qdrant"
echo ""
echo "  2. Start backend:"
echo "     cd backend && uvicorn main:app --reload"
echo ""
echo "  3. Start frontend:"
echo "     cd frontend && npm run dev"
echo ""
echo "  OR use Docker Compose for everything:"
echo "     docker compose up"
echo ""
