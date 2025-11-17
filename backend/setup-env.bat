@echo off
REM OOPLab Backend Environment Setup Script for Windows
REM This script helps create the .env file with proper configuration

echo 🔧 Setting up OOPLab Backend Environment...

REM Check if .env already exists
if exist ".env" (
    echo ⚠️  .env file already exists. Creating backup...
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
    set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
    set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"
    copy .env .env.backup.%timestamp%
)

REM Create .env file
(
echo # Database Configuration
echo DB_HOST=YOUR_DATABASE_HOST
echo DB_NAME=YOUR_DATABASE_NAME
echo DB_USER=YOUR_DATABASE_USER
echo DB_PASSWORD=YOUR_DATABASE_PASSWORD
echo DB_PORT=3306
echo.
echo # Server Configuration
echo PORT=5000
echo NODE_ENV=development
echo.
echo # JWT Configuration
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
echo JWT_EXPIRES_IN=7d
echo.
echo # Bcrypt Configuration
echo BCRYPT_ROUNDS=12
echo.
echo # Google OAuth Configuration ^(Optional - leave empty to disable^)
echo # GOOGLE_CLIENT_ID=your-google-client-id
echo # GOOGLE_CLIENT_SECRET=your-google-client-secret
echo # GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
echo.
echo # Frontend URL ^(for OAuth redirects^)
echo FRONTEND_URL=http://localhost:3000
echo.
echo # CORS Configuration
echo CORS_ORIGIN=http://localhost:3000,http://localhost:3001
echo.
echo # Rate Limiting
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX_REQUESTS=100
) > .env

echo ✅ .env file created successfully!
echo.
echo 📝 Next steps:
echo 1. Review the .env file and update any values as needed
echo 2. For Google OAuth, uncomment and set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
echo 3. Run the database migration with your credentials
echo 4. Start the server: npm run dev
echo.
echo 🔐 Security Note: Change the JWT_SECRET in production!
