#!/bin/bash

echo "=== Generate Production Secrets ==="
echo ""
echo "Add these to your .env file or Render environment variables:"
echo ""

JWT_SECRET=$(python -c "import secrets; print(secrets.token_hex(32))")
JWT_REFRESH=$(python -c "import secrets; print(secrets.token_hex(32))")
PASSWORD_RESET=$(python -c "import secrets; print(secrets.token_hex(32))")

echo "JWT_SECRET_KEY=$JWT_SECRET"
echo "JWT_REFRESH_SECRET_KEY=$JWT_REFRESH"
echo "PASSWORD_RESET_SECRET=$PASSWORD_RESET"
echo ""
echo "Keep these values secure!"
