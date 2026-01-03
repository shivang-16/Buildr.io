#!/bin/sh
set -e

# Decode Google Credentials if the environment variable is set
if [ -n "$GOOGLE_CREDENTIALS_JSON_BASE64" ]; then
    echo "Decoding Google Credentials..."
    mkdir -p $(dirname $GOOGLE_APPLICATION_CREDENTIALS)
    echo "$GOOGLE_CREDENTIALS_JSON_BASE64" | base64 -d > "$GOOGLE_APPLICATION_CREDENTIALS"
    echo "Google Credentials decoded to $GOOGLE_APPLICATION_CREDENTIALS"
fi

# Execute the main container command
exec "$@"
