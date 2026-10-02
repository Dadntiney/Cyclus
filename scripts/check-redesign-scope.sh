#!/usr/bin/env bash
# Redesign guard: a presentation-only PR must not touch data, auth,
# server actions, Supabase or API code. Usage:
#   scripts/check-redesign-scope.sh [base-ref]   (default: origin/claude/cyclus-webapp-deploy-c5xtz0)
set -euo pipefail
base="${1:-origin/claude/cyclus-webapp-deploy-c5xtz0}"
protected='^(src/lib/(actions|data|supabase|cycle|recommendations|buddy|push|medication|nutrition|sleep|mental-wellbeing|images|dates|i18n)/|src/app/api/|src/app/auth/|supabase/|src/proxy\.ts|src/middleware\.ts)'
hits=$(git diff --name-only "$base"...HEAD | grep -E "$protected" || true)
if [ -n "$hits" ]; then
  echo "Redesign scope check failed — these files hold data/auth/logic:" >&2
  echo "$hits" >&2
  exit 1
fi
echo "Redesign scope check passed: no data, auth or API files changed."
