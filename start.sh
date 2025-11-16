#!/bin/bash
# Chef Chatter - Start everything with one command (macOS/Linux)

echo "🍽️  Starting Chef Chatter..."
echo ""

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Function to start backend
start_backend() {
    echo "📡 Starting backend server (port 3000)..."
    cd "$BACKEND_DIR"
    node server.js
}

# Function to start frontend
start_frontend() {
    echo "⚛️  Starting frontend (port 8080)..."
    cd "$PROJECT_ROOT"
    npm run dev
}

# Start both in background
start_backend &
BACKEND_PID=$!

start_frontend &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo ""
echo "📍 Backend:  http://localhost:3000"
echo "📍 Frontend: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
