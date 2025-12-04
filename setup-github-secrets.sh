#!/bin/bash
# GitHub Secrets Setup Helper Script

echo "🔐 GitHub Secrets Configuration Helper"
echo "======================================"
echo ""

# Server details
PROD_HOST="112.198.194.104"
PROD_PORT="22"

echo "Production Server: $PROD_HOST"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    echo ""
    echo "Or configure secrets manually:"
    echo "1. Go to: https://github.com/tildemark/event-feedback/settings/secrets/actions"
    echo "2. Add the secrets listed below"
    echo ""
fi

# Using password authentication - no SSH key needed
echo "ℹ️  Using password authentication (no SSH key required)"
echo ""

echo "📋 Copy these values to GitHub Secrets:"
echo "========================================"
echo ""

echo "Secret: PROD_SERVER_HOST"
echo "Value: $PROD_HOST"
echo ""

echo "Secret: PROD_SERVER_PORT"
echo "Value: $PROD_PORT"
echo ""

echo "Secret: PROD_SERVER_USER"
read -p "Enter SSH username (e.g., root, ubuntu): " SSH_USER
echo "Value: $SSH_USER"
echo ""

echo "Secret: PROD_SERVER_PASSWORD"
read -sp "Enter SSH password: " SSH_PASSWORD
echo ""
echo "Value: ********** (password hidden)"
echo ""

# Offer to use gh CLI
if command -v gh &> /dev/null; then
    echo "🚀 Set secrets using GitHub CLI? (y/n)"
    read -p "> " USE_GH
    
    if [ "$USE_GH" = "y" ]; then
        echo "Setting secrets..."
        
        gh secret set PROD_SERVER_HOST -b"$PROD_HOST"
        gh secret set PROD_SERVER_PORT -b"$PROD_PORT"
        gh secret set PROD_SERVER_USER -b"$SSH_USER"
        
        echo "Setting PROD_SERVER_SSH_KEY..."
        cat ~/.ssh/github_deploy | gh secret set PROD_SERVER_SSH_KEY
        
        echo "✅ Secrets configured!"
    fi
fi

        gh secret set PROD_SERVER_HOST -b"$PROD_HOST"
        gh secret set PROD_SERVER_PORT -b"$PROD_PORT"
        gh secret set PROD_SERVER_USER -b"$SSH_USER"
        
        echo "Setting PROD_SERVER_PASSWORD..."
        echo "$SSH_PASSWORD" | gh secret set PROD_SERVER_PASSWORD
        
        echo "✅ Secrets configured!"