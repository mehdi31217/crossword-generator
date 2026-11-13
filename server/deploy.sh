#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Crossword Gen Pro — Production Deploy Script
# ═══════════════════════════════════════════════════════════════
#
# Prerequisites on target server:
#   curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
#   apt install -y nodejs postgresql redis-server nginx pm2
#   npm install -g pm2
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh                    # Deploy everything
#   ./deploy.sh --skip-build       # Skip frontend build
#   ./deploy.sh --dry-run          # Show what would be done
#
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Config ──────────────────────────────────────────────────
PROJECT_DIR="/opt/crossword-gen-pro"
REPO_URL=""                                     # Set your git repo URL here
BRANCH="main"
NODE_ENV="production"

# Frontend
FRONTEND_PORT=8080
VITE_API_URL="http://localhost:8081"

# Backend
BACKEND_PORT=8081
DB_TYPE="postgres"
DATABASE_URL="postgresql://crossword:changeme@localhost:5432/crossword"
REDIS_URL="redis://localhost:6379"
JWT_SECRET=""                                   # MUST SET THIS
RATE_LIMIT=300

# ─── Colors ──────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ─── Parse flags ────────────────────────────────────────────
SKIP_BUILD=false
DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    --dry-run) DRY_RUN=true ;;
  esac
done

info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }
run() {
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY-RUN]${NC} $1"
  else
    eval "$1"
  fi
}

# ─── Step 1: Check prerequisites ────────────────────────────
info "Step 1/8: Checking prerequisites..."
command -v node >/dev/null 2>&1 || fail "Node.js is required"
command -v npm >/dev/null 2>&1 || fail "npm is required"
command -v pm2 >/dev/null 2>&1 || warn "pm2 not found — install with: npm install -g pm2"
ok "Prerequisites check passed"

# ─── Step 2: Setup directories ───────────────────────────────
info "Step 2/8: Setting up directories..."
run "mkdir -p $PROJECT_DIR"
run "mkdir -p $PROJECT_DIR/server/logs"
run "mkdir -p $PROJECT_DIR/server/local-data"
run "mkdir -p $PROJECT_DIR/dist"
ok "Directories ready"

# ─── Step 3: Clone/pull code ────────────────────────────────
info "Step 3/8: Fetching code..."
if [ -d "$PROJECT_DIR/.git" ]; then
  run "cd $PROJECT_DIR && git fetch origin && git reset --hard origin/$BRANCH"
else
  if [ -n "$REPO_URL" ]; then
    run "git clone --branch $BRANCH $REPO_URL $PROJECT_DIR"
  else
    warn "REPO_URL not set — copying from current directory"
    run "cp -r ./* $PROJECT_DIR/ 2>/dev/null || cp -r . $PROJECT_DIR/"
  fi
fi
ok "Code ready"

# ─── Step 4: Install backend dependencies ────────────────────
info "Step 4/8: Installing backend dependencies..."
run "cd $PROJECT_DIR/server && npm install --production"
ok "Backend dependencies installed"

# ─── Step 5: Setup PostgreSQL ───────────────────────────────
info "Step 5/8: Setting up PostgreSQL..."
if command -v psql >/dev/null 2>&1; then
  run "sudo -u postgres psql -c \"CREATE DATABASE crossword;\" 2>/dev/null || true"
  run "sudo -u postgres psql -c \"CREATE USER crossword WITH PASSWORD 'changeme';\" 2>/dev/null || true"
  run "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE crossword TO crossword;\" 2>/dev/null || true"
  # Run schema migration
  run "cd $PROJECT_DIR/server && PGPASSWORD=changeme psql -h localhost -U crossword -d crossword -f schema.pg.sql 2>/dev/null || true"
  ok "PostgreSQL ready"
else
  warn "PostgreSQL not found — install with: apt install postgresql"
fi

# ─── Step 6: Setup Redis ────────────────────────────────────
info "Step 6/8: Setting up Redis..."
if command -v redis-server >/dev/null 2>&1; then
  run "redis-cli ping 2>/dev/null || sudo service redis-server start"
  ok "Redis ready"
else
  warn "Redis not found — install with: apt install redis-server"
fi

# ─── Step 7: Build frontend (optional) ──────────────────────
if [ "$SKIP_BUILD" = false ]; then
  info "Step 7/8: Building frontend..."
  run "cd $PROJECT_DIR && npm install"
  run "cd $PROJECT_DIR && VITE_API_URL=$VITE_API_URL npx vite build"
  ok "Frontend built"
else
  info "Step 7/8: Skipping frontend build (--skip-build)"
fi

# ─── Step 8: Start server with PM2 ──────────────────────────
info "Step 8/8: Starting server..."
if [ "$DRY_RUN" = false ]; then
  # Create .env
  cat > "$PROJECT_DIR/server/.env" << EOF
NODE_ENV=$NODE_ENV
PORT=$BACKEND_PORT
DB_TYPE=$DB_TYPE
DATABASE_URL=$DATABASE_URL
REDIS_URL=$REDIS_URL
JWT_SECRET=$JWT_SECRET
RATE_LIMIT=$RATE_LIMIT
PG_POOL_MAX=20
EOF

  # Start with PM2
  cd "$PROJECT_DIR"
  pm2 delete crossword-server 2>/dev/null || true
  pm2 start ecosystem.config.cjs --env production
  pm2 save
  ok "Server started with PM2"
else
  info "Step 8/8: Skipping server start (--dry-run)"
fi

# ─── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Crossword Gen Pro — Deploy Complete!       ${NC}"
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo ""
echo "  Backend:  http://localhost:$BACKEND_PORT"
echo "  API docs: http://localhost:$BACKEND_PORT/api/health"
echo "  Backend:  http://localhost:$BACKEND_PORT"
echo ""
echo "  PM2 commands:"
echo "    pm2 status        — Check cluster health"
echo "    pm2 logs          — View logs"
echo "    pm2 monit         — Monitor CPU/memory"
echo "    pm2 reload all    — Zero-downtime restart"
echo ""
echo "  Nginx config should proxy:"
echo "    /api/*  → http://localhost:$BACKEND_PORT"
echo "    /*      → http://localhost:$FRONTEND_PORT (or Vite preview)"
echo ""
