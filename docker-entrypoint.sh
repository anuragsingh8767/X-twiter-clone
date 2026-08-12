#!/bin/sh
set -e

SECRET_FILE=/app/data/.jwt_secret

# Generate a JWT secret on first run and persist it to a volume
if [ ! -f "$SECRET_FILE" ]; then
  echo "[startup] Generating JWT secret for the first time..."
  node -e "const crypto = require('crypto'); require('fs').writeFileSync('$SECRET_FILE', crypto.randomBytes(64).toString('hex'));"
  echo "[startup] JWT secret saved."
fi

# Load the persisted secret into the environment
export JWT_SECRET=$(cat "$SECRET_FILE")

# Hand off to the main process (CMD in Dockerfile)
exec "$@"
