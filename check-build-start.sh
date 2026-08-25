#!/bin/sh

# Read secrets from files and export as environment variables
MAPBOX_USERNAME="$(cat /run/secrets/mapbox_username)"
export MAPBOX_USERNAME
MAPBOX_API_KEY="$(cat /run/secrets/mapbox_api_key)"
export MAPBOX_API_KEY

# Watch for changes in build time config files or images etc
WATCH_DIR="/twa/public"

# Hash file to store the previous state
HASH_FILE="/twa/.public_hash/previous-state-of-public-folder"

# Compute the current hash of the directory
CURRENT_HASH=$(find "$WATCH_DIR" -type f -exec sha256sum {} + | sha256sum | awk '{ print $1 }')

# skip the ESlint on prod, no one must know my secrets
export NEXT_SKIP_TYPE_CHECK=true
export NEXT_SKIP_ESLINT=true

# Generate the lucide icon registry from the mounted config in $WATCH_DIR.
# This must happen BEFORE any `pnpm run build` 
# Below `next build` compiles the registry into the bundle, so generating it afterwards would have no effect on what is served.
# It writes to /twa/ui, outside $WATCH_DIR, so it cannot disturb the hash computed above.
echo "Generating icon registry..."
node /twa/scripts/generate-icon-registry.mjs || exit 1

# Check if the hash file exists
if [ -f "$HASH_FILE" ]; then
  # Read the previous hash
  PREVIOUS_HASH=$(cat "$HASH_FILE")

  # Compare the hashes
  if [ "$CURRENT_HASH" = "$PREVIOUS_HASH" ]; then
    echo "No changes detected in $WATCH_DIR. Skipping build."
  else
    echo "Changes detected in $WATCH_DIR. Rebuilding..."
    pnpm run build && echo "$CURRENT_HASH" > "$HASH_FILE"
  fi
else
  echo "Hash file not found. Running initial build..."
  pnpm run build && echo "$CURRENT_HASH" > "$HASH_FILE"
fi

# Check if the .next directory exists
if [ ! -d "/twa/.next" ]; then
  echo "Production build not found. Running build..."
  pnpm run build
fi

# Start the application
pnpm start-docker