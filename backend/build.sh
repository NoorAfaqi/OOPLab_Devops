#!/bin/bash

# OOPLab Backend Docker Build Script
# This script helps build and run the backend API in Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
IMAGE_NAME="ooplab-backend-api"
CONTAINER_NAME="ooplab-backend-api"
PORT="5000"
ENV_FILE=".env"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if .env file exists
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success ".env file created from .env.example"
            print_warning "Please edit .env file with your actual values before running the container"
        else
            print_error ".env.example file not found. Please create .env file manually"
            exit 1
        fi
    else
        print_success ".env file found"
    fi
}

# Function to build Docker image
build_image() {
    print_status "Building Docker image: $IMAGE_NAME"
    docker build -t $IMAGE_NAME .
    print_success "Docker image built successfully"
}

# Function to build production image
build_prod_image() {
    print_status "Building production Docker image: $IMAGE_NAME:prod"
    docker build -f Dockerfile.prod -t $IMAGE_NAME:prod .
    print_success "Production Docker image built successfully"
}

# Function to stop and remove existing container
cleanup_container() {
    if docker ps -a --format 'table {{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
        print_status "Stopping existing container: $CONTAINER_NAME"
        docker stop $CONTAINER_NAME
        print_status "Removing existing container: $CONTAINER_NAME"
        docker rm $CONTAINER_NAME
        print_success "Container cleaned up"
    fi
}

# Function to run container
run_container() {
    print_status "Starting container: $CONTAINER_NAME"
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:5000 \
        --env-file $ENV_FILE \
        -v $(pwd)/logs:/app/logs \
        $IMAGE_NAME
    
    print_success "Container started successfully"
    print_status "API is available at: http://localhost:$PORT"
    print_status "Health check: http://localhost:$PORT/api/health"
}

# Function to run production container
run_prod_container() {
    print_status "Starting production container: $CONTAINER_NAME"
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:5000 \
        --env-file $ENV_FILE \
        -v $(pwd)/logs:/app/logs \
        $IMAGE_NAME:prod
    
    print_success "Production container started successfully"
    print_status "API is available at: http://localhost:$PORT"
    print_status "Health check: http://localhost:$PORT/api/health"
}

# Function to show logs
show_logs() {
    print_status "Showing logs for container: $CONTAINER_NAME"
    docker logs -f $CONTAINER_NAME
}

# Function to show container status
show_status() {
    print_status "Container status:"
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Function to test API
test_api() {
    print_status "Testing API endpoints..."
    
    # Wait for container to start
    sleep 5
    
    # Test health endpoint
    if curl -s http://localhost:$PORT/api/health > /dev/null; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        return 1
    fi
    
    # Test products endpoint
    if curl -s http://localhost:$PORT/api/products > /dev/null; then
        print_success "Products API is working"
    else
        print_warning "Products API test failed (this might be expected if database is not configured)"
    fi
}

# Function to show help
show_help() {
    echo "OOPLab Backend Docker Build Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build       Build Docker image"
    echo "  build-prod  Build production Docker image"
    echo "  run         Build and run container"
    echo "  run-prod    Build and run production container"
    echo "  start       Start existing container"
    echo "  stop        Stop container"
    echo "  restart     Restart container"
    echo "  logs        Show container logs"
    echo "  status      Show container status"
    echo "  test        Test API endpoints"
    echo "  clean       Stop and remove container"
    echo "  clean-all   Stop, remove container and image"
    echo "  help        Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  IMAGE_NAME      Docker image name (default: ooplab-backend-api)"
    echo "  CONTAINER_NAME  Container name (default: ooplab-backend-api)"
    echo "  PORT            Host port (default: 5000)"
    echo "  ENV_FILE        Environment file (default: .env)"
}

# Main script logic
case "${1:-help}" in
    "build")
        check_docker
        build_image
        ;;
    "build-prod")
        check_docker
        build_prod_image
        ;;
    "run")
        check_docker
        check_env_file
        cleanup_container
        build_image
        run_container
        test_api
        ;;
    "run-prod")
        check_docker
        check_env_file
        cleanup_container
        build_prod_image
        run_prod_container
        test_api
        ;;
    "start")
        check_docker
        docker start $CONTAINER_NAME
        print_success "Container started"
        ;;
    "stop")
        check_docker
        docker stop $CONTAINER_NAME
        print_success "Container stopped"
        ;;
    "restart")
        check_docker
        docker restart $CONTAINER_NAME
        print_success "Container restarted"
        ;;
    "logs")
        check_docker
        show_logs
        ;;
    "status")
        check_docker
        show_status
        ;;
    "test")
        check_docker
        test_api
        ;;
    "clean")
        check_docker
        cleanup_container
        ;;
    "clean-all")
        check_docker
        cleanup_container
        docker rmi $IMAGE_NAME 2>/dev/null || true
        docker rmi $IMAGE_NAME:prod 2>/dev/null || true
        print_success "Container and images cleaned up"
        ;;
    "help"|*)
        show_help
        ;;
esac
