#!/bin/bash

# Batalj Deployment Script
# Usage: ./deploy.sh [dev|prod] [start|stop|restart|build|logs]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENV=$1
ACTION=$2

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Print usage
usage() {
    echo "Usage: $0 [dev|prod] [start|stop|restart|build|logs|status]"
    echo ""
    echo "Environments:"
    echo "  dev   - Local development environment (MongoDB only)"
    echo "  prod  - Production environment (all services)"
    echo ""
    echo "Actions:"
    echo "  start   - Start services (default)"
    echo "  stop    - Stop services"
    echo "  restart - Restart services"
    echo "  build   - Build and start services"
    echo "  logs    - Show service logs"
    echo "  status  - Show service status"
    echo ""
    echo "Examples:"
    echo "  $0 dev start    - Start MongoDB for local development"
    echo "  $0 prod build   - Build and start production services"
    echo "  $0 prod logs    - Show production logs"
    exit 1
}

# Validate environment
if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
    print_message "$RED" "Error: Invalid environment '$ENV'. Use 'dev' or 'prod'."
    usage
fi

# Validate action
if [[ ! "$ACTION" =~ ^(start|stop|restart|build|logs|status)$ ]]; then
    print_message "$RED" "Error: Invalid action '$ACTION'."
    usage
fi

# Detect docker compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    print_message "$RED" "Error: Neither 'docker compose' nor 'docker-compose' found"
    exit 1
fi

# Set compose file based on environment
if [ "$ENV" = "dev" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    print_message "$YELLOW" "Environment: Development (MongoDB only)"
else
    COMPOSE_FILE="docker-compose.yml"
    print_message "$YELLOW" "Environment: Production (all services)"
fi

# Execute action
case $ACTION in
    start)
        print_message "$GREEN" "Starting services..."
        $DOCKER_COMPOSE -f $COMPOSE_FILE up -d
        print_message "$GREEN" "Services started successfully!"
        if [ "$ENV" = "dev" ]; then
            print_message "$YELLOW" "MongoDB is running on localhost:27017"
            print_message "$YELLOW" "Run 'npm run dev' in backend and webapp directories to start development servers"
        else
            print_message "$YELLOW" "Application is running on http://localhost"
        fi
        ;;

    stop)
        print_message "$YELLOW" "Stopping services..."
        $DOCKER_COMPOSE -f $COMPOSE_FILE down
        print_message "$GREEN" "Services stopped successfully!"
        ;;

    restart)
        print_message "$YELLOW" "Restarting services..."
        $DOCKER_COMPOSE -f $COMPOSE_FILE restart
        print_message "$GREEN" "Services restarted successfully!"
        ;;

    build)
        print_message "$GREEN" "Building and starting services..."
        $DOCKER_COMPOSE -f $COMPOSE_FILE up -d --build
        print_message "$GREEN" "Services built and started successfully!"
        if [ "$ENV" = "prod" ]; then
            print_message "$YELLOW" "Application is running on http://localhost"
        fi
        ;;

    logs)
        print_message "$YELLOW" "Showing logs (Ctrl+C to exit)..."
        $DOCKER_COMPOSE -f $COMPOSE_FILE logs -f
        ;;

    status)
        print_message "$YELLOW" "Service status:"
        $DOCKER_COMPOSE -f $COMPOSE_FILE ps
        ;;
esac
