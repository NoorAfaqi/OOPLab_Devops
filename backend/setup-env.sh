#!/bin/bash

# OOPLab Backend Environment Setup Script
# This script helps create the .env file with proper configuration

echo "🔧 Setting up OOPLab Backend Environment..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Creating backup..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create .env file
cat > .env << EOF
# Database Configuration
DB_HOST=YOUR_DATABASE_HOST
DB_NAME=YOUR_DATABASE_NAME
DB_USER=YOUR_DATABASE_USER
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(openssl rand -hex 16)
JWT_EXPIRES_IN=7d

# Bcrypt Configuration
BCRYPT_ROUNDS=12

# Google OAuth Configuration (Optional - leave empty to disable)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Review the .env file and update any values as needed"
echo "2. For Google OAuth, uncomment and set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
echo "3. Run the database migration with your credentials"
echo "4. Start the server: npm run dev"
echo ""
echo "🔐 Security Note: Change the JWT_SECRET in production!"
