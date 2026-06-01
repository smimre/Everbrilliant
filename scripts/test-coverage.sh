#!/bin/bash
# Test Coverage Runner: ./scripts/test-coverage.sh [unit|integration|e2e|all]
set -e
MODE="${1:-unit}"
echo "🧪 Running tests: $MODE"

case "$MODE" in
  unit)
    echo "▶ API Unit Tests..."
    cd apps/api && npx jest --testPathPattern="__tests__/unit" --coverage --forceExit && cd ../..
    echo "▶ Web Unit Tests..."
    cd apps/web && npx jest --coverage && cd ../..
    ;;
  integration)
    echo "▶ API Integration Tests..."
    cd apps/api && npx jest --testPathPattern="__tests__/integration" --forceExit --runInBand && cd ../..
    ;;
  e2e)
    echo "▶ E2E Tests..."
    cd tests/e2e && npx playwright test --project="Desktop Chrome" && cd ../..
    ;;
  all)
    bash "$0" unit && bash "$0" integration && bash "$0" e2e
    ;;
esac
echo "✅ Done!"
