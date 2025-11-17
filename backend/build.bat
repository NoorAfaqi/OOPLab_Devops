@echo off
REM OOPLab Backend Docker Build Script for Windows
REM This script helps build and run the backend API in Docker

setlocal enabledelayedexpansion

REM Default values
set IMAGE_NAME=ooplab-backend-api
set CONTAINER_NAME=ooplab-backend-api
set PORT=5000
set ENV_FILE=.env

REM Function to check if Docker is running
:check_docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    exit /b 1
)
echo [SUCCESS] Docker is running
goto :eof

REM Function to check if .env file exists
:check_env_file
if not exist "%ENV_FILE%" (
    echo [WARNING] .env file not found. Creating from .env.example...
    if exist ".env.example" (
        copy .env.example .env >nul
        echo [SUCCESS] .env file created from .env.example
        echo [WARNING] Please edit .env file with your actual values before running the container
    ) else (
        echo [ERROR] .env.example file not found. Please create .env file manually
        exit /b 1
    )
) else (
    echo [SUCCESS] .env file found
)
goto :eof

REM Function to build Docker image
:build_image
echo [INFO] Building Docker image: %IMAGE_NAME%
docker build -t %IMAGE_NAME% .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build Docker image
    exit /b 1
)
echo [SUCCESS] Docker image built successfully
goto :eof

REM Function to build production image
:build_prod_image
echo [INFO] Building production Docker image: %IMAGE_NAME%:prod
docker build -f Dockerfile.prod -t %IMAGE_NAME%:prod .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build production Docker image
    exit /b 1
)
echo [SUCCESS] Production Docker image built successfully
goto :eof

REM Function to stop and remove existing container
:cleanup_container
docker ps -a --format "table {{.Names}}" | findstr /C:"%CONTAINER_NAME%" >nul
if %errorlevel% equ 0 (
    echo [INFO] Stopping existing container: %CONTAINER_NAME%
    docker stop %CONTAINER_NAME%
    echo [INFO] Removing existing container: %CONTAINER_NAME%
    docker rm %CONTAINER_NAME%
    echo [SUCCESS] Container cleaned up
)
goto :eof

REM Function to run container
:run_container
echo [INFO] Starting container: %CONTAINER_NAME%
docker run -d --name %CONTAINER_NAME% -p %PORT%:5000 --env-file %ENV_FILE% -v "%cd%\logs:/app/logs" %IMAGE_NAME%
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start container
    exit /b 1
)
echo [SUCCESS] Container started successfully
echo [INFO] API is available at: http://localhost:%PORT%
echo [INFO] Health check: http://localhost:%PORT%/api/health
goto :eof

REM Function to run production container
:run_prod_container
echo [INFO] Starting production container: %CONTAINER_NAME%
docker run -d --name %CONTAINER_NAME% -p %PORT%:5000 --env-file %ENV_FILE% -v "%cd%\logs:/app/logs" %IMAGE_NAME%:prod
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start production container
    exit /b 1
)
echo [SUCCESS] Production container started successfully
echo [INFO] API is available at: http://localhost:%PORT%
echo [INFO] Health check: http://localhost:%PORT%/api/health
goto :eof

REM Function to show logs
:show_logs
echo [INFO] Showing logs for container: %CONTAINER_NAME%
docker logs -f %CONTAINER_NAME%
goto :eof

REM Function to show container status
:show_status
echo [INFO] Container status:
docker ps --filter "name=%CONTAINER_NAME%" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
goto :eof

REM Function to test API
:test_api
echo [INFO] Testing API endpoints...

REM Wait for container to start
timeout /t 5 /nobreak >nul

REM Test health endpoint
curl -s http://localhost:%PORT%/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Health check passed
) else (
    echo [ERROR] Health check failed
    goto :eof
)

REM Test products endpoint
curl -s http://localhost:%PORT%/api/products >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Products API is working
) else (
    echo [WARNING] Products API test failed (this might be expected if database is not configured)
)
goto :eof

REM Function to show help
:show_help
echo OOPLab Backend Docker Build Script
echo.
echo Usage: %0 [COMMAND]
echo.
echo Commands:
echo   build       Build Docker image
echo   build-prod  Build production Docker image
echo   run         Build and run container
echo   run-prod    Build and run production container
echo   start       Start existing container
echo   stop        Stop container
echo   restart     Restart container
echo   logs        Show container logs
echo   status      Show container status
echo   test        Test API endpoints
echo   clean       Stop and remove container
echo   clean-all   Stop, remove container and image
echo   help        Show this help message
echo.
echo Environment variables:
echo   IMAGE_NAME      Docker image name (default: ooplab-backend-api)
echo   CONTAINER_NAME  Container name (default: ooplab-backend-api)
echo   PORT            Host port (default: 5000)
echo   ENV_FILE        Environment file (default: .env)
goto :eof

REM Main script logic
if "%1"=="" goto :show_help
if "%1"=="help" goto :show_help

if "%1"=="build" (
    call :check_docker
    call :build_image
    goto :eof
)

if "%1"=="build-prod" (
    call :check_docker
    call :build_prod_image
    goto :eof
)

if "%1"=="run" (
    call :check_docker
    call :check_env_file
    call :cleanup_container
    call :build_image
    call :run_container
    call :test_api
    goto :eof
)

if "%1"=="run-prod" (
    call :check_docker
    call :check_env_file
    call :cleanup_container
    call :build_prod_image
    call :run_prod_container
    call :test_api
    goto :eof
)

if "%1"=="start" (
    call :check_docker
    docker start %CONTAINER_NAME%
    echo [SUCCESS] Container started
    goto :eof
)

if "%1"=="stop" (
    call :check_docker
    docker stop %CONTAINER_NAME%
    echo [SUCCESS] Container stopped
    goto :eof
)

if "%1"=="restart" (
    call :check_docker
    docker restart %CONTAINER_NAME%
    echo [SUCCESS] Container restarted
    goto :eof
)

if "%1"=="logs" (
    call :check_docker
    call :show_logs
    goto :eof
)

if "%1"=="status" (
    call :check_docker
    call :show_status
    goto :eof
)

if "%1"=="test" (
    call :check_docker
    call :test_api
    goto :eof
)

if "%1"=="clean" (
    call :check_docker
    call :cleanup_container
    goto :eof
)

if "%1"=="clean-all" (
    call :check_docker
    call :cleanup_container
    docker rmi %IMAGE_NAME% 2>nul
    docker rmi %IMAGE_NAME%:prod 2>nul
    echo [SUCCESS] Container and images cleaned up
    goto :eof
)

echo [ERROR] Unknown command: %1
call :show_help
