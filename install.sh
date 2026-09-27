#!/usr/bin/env bash
#
# SmartDine — one-shot installer
#
# Installs dependencies, prepares your .env file, syncs the database schema
# and (optionally) seeds sample data + staff accounts.
#
# Usage:
#   ./install.sh                 interactive install
#   ./install.sh -y              non-interactive, assumes "yes" to prompts
#   ./install.sh --no-seed       never seed the database
#   ./install.sh --skip-install  skip `npm install` (deps already installed)
#
set -euo pipefail

# ---------------------------------------------------------------------------
# Colors / helpers
# ---------------------------------------------------------------------------
if [[ -t 1 ]]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; RED=$'\033[31m'; GREEN=$'\033[32m'
  YELLOW=$'\033[33m'; BLUE=$'\033[34m'; RESET=$'\033[0m'
else
  BOLD=""; DIM=""; RED=""; GREEN=""; YELLOW=""; BLUE=""; RESET=""
fi

info()  { printf "%s➜%s %s\n" "$BLUE" "$RESET" "$1"; }
ok()    { printf "%s✔%s %s\n" "$GREEN" "$RESET" "$1"; }
warn()  { printf "%s⚠%s %s\n" "$YELLOW" "$RESET" "$1"; }
fail()  { printf "%s✘ %s%s\n" "$RED" "$1" "$RESET"; exit 1; }
step()  { printf "\n%s%s%s\n" "$BOLD" "$1" "$RESET"; }

# ---------------------------------------------------------------------------
# Flags
# ---------------------------------------------------------------------------
ASSUME_YES=false
SEED=""        # "" = ask, "yes" = force seed, "no" = never seed
SKIP_INSTALL=false

for arg in "$@"; do
  case "$arg" in
    -y|--yes) ASSUME_YES=true ;;
    --seed) SEED="yes" ;;
    --no-seed) SEED="no" ;;
    --skip-install) SKIP_INSTALL=true ;;
    -h|--help)
      grep -E '^#( |$)' "$0" | sed -E 's/^# ?//'
      exit 0
      ;;
    *)
      fail "Unknown option: $arg (see --help)"
      ;;
  esac
done

cd "$(dirname "$0")"

step "SmartDine installer"

# ---------------------------------------------------------------------------
# 1. Tooling checks
# ---------------------------------------------------------------------------
step "1/6  Checking requirements"

command -v node >/dev/null 2>&1 || fail "Node.js is not installed. Install Node.js 20.9+ from https://nodejs.org and re-run."
command -v npm  >/dev/null 2>&1 || fail "npm was not found alongside Node.js. Reinstall Node.js and re-run."

NODE_OK=$(node -e '
  const [major, minor] = process.versions.node.split(".").map(Number);
  process.stdout.write(major > 20 || (major === 20 && minor >= 9) ? "1" : "0");
')
if [[ "$NODE_OK" != "1" ]]; then
  fail "Node.js $(node -v) is too old. SmartDine (Next.js 16) requires Node.js >= 20.9.0."
fi
ok "Node.js $(node -v)"
ok "npm $(npm -v)"

if command -v mysql >/dev/null 2>&1; then
  ok "MySQL client found"
else
  warn "No local 'mysql' client found — that's fine if your database is hosted elsewhere."
fi

# ---------------------------------------------------------------------------
# 2. Dependencies
# ---------------------------------------------------------------------------
step "2/6  Installing dependencies"
if $SKIP_INSTALL; then
  warn "Skipped (--skip-install)"
elif [[ -f package-lock.json ]]; then
  npm ci
  ok "Dependencies installed (npm ci)"
else
  npm install
  ok "Dependencies installed (npm install)"
fi

# ---------------------------------------------------------------------------
# 3. Environment file
# ---------------------------------------------------------------------------
step "3/6  Configuring environment"

NEEDS_ENV_EDIT=false
if [[ -f .env ]]; then
  ok ".env already exists — leaving it untouched"
else
  cp .env.example .env
  GENERATED_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  # Portable in-place edit for both GNU and BSD/macOS sed
  sed -i.bak "s#^SESSION_SECRET=\"\"#SESSION_SECRET=\"${GENERATED_SECRET}\"#" .env && rm -f .env.bak
  ok "Created .env from .env.example (generated a random SESSION_SECRET)"
  NEEDS_ENV_EDIT=true
fi

if grep -q '^DATABASE_URL="mysql://user:password@localhost:3306/smartdine"$' .env 2>/dev/null; then
  warn "DATABASE_URL in .env is still the placeholder value."
  NEEDS_ENV_EDIT=true
fi

if $NEEDS_ENV_EDIT; then
  warn "Edit .env now and set at least DATABASE_URL (and Razorpay keys if you'll take payments)."
  if ! $ASSUME_YES; then
    read -r -p "Press Enter once .env is ready to continue, or Ctrl+C to stop and edit it first... " _
  fi
fi

# ---------------------------------------------------------------------------
# 4. Database schema
# ---------------------------------------------------------------------------
step "4/6  Syncing database schema"
npx prisma generate
npx prisma db push
ok "Prisma client generated and database schema is in sync"

# ---------------------------------------------------------------------------
# 5. Seed data
# ---------------------------------------------------------------------------
step "5/6  Seed data"

DO_SEED=false
if [[ "$SEED" == "yes" ]]; then
  DO_SEED=true
elif [[ "$SEED" == "no" ]]; then
  DO_SEED=false
elif $ASSUME_YES; then
  DO_SEED=true
else
  read -r -p "Seed sample tables/menu and create staff accounts (admin/kitchen/steward)? [Y/n] " reply
  case "$reply" in
    [nN]*) DO_SEED=false ;;
    *) DO_SEED=true ;;
  esac
fi

if $DO_SEED; then
  node prisma/seed.js
else
  warn "Skipped seeding — run 'npx prisma db seed' whenever you're ready."
fi

# ---------------------------------------------------------------------------
# 6. Done
# ---------------------------------------------------------------------------
step "6/6  Done"
ok "SmartDine is installed."
echo
echo "  Start the dev server:   ${BOLD}npm run dev${RESET}"
echo "  Build for production:   ${BOLD}npm run build && npm start${RESET}"
echo "  Run with PM2:            ${BOLD}pm2 start ecosystem.config.js${RESET}"
echo
if $DO_SEED; then
  warn "If new staff accounts were just created, their passwords were printed above ONLY ONCE — save them now."
fi
echo "See README.md for environment variables, deployment notes and the full feature list."
