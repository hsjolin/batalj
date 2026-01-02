#!/bin/bash

# Batalj Remote Deployment Script for Unraid
# Usage: ./deploy-remote.sh [server-address] [action]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER=${1:-""}
ACTION=${2:-deploy}
REMOTE_USER=${REMOTE_USER:-root}
REMOTE_PATH=${REMOTE_PATH:-/mnt/user/appdata/batalj}
PROJECT_NAME="batalj"

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Print usage
usage() {
    echo "Usage: $0 <server-address> [action]"
    echo ""
    echo "Arguments:"
    echo "  server-address  - IP address or hostname of Unraid server"
    echo ""
    echo "Actions:"
    echo "  deploy          - Deploy application to server (default)"
    echo "  start           - Start services on server"
    echo "  stop            - Stop services on server"
    echo "  restart         - Restart services on server"
    echo "  logs            - Show logs from server"
    echo "  status          - Show service status"
    echo "  cleanup         - Remove old images and containers"
    echo ""
    echo "Environment variables:"
    echo "  REMOTE_USER     - SSH user (default: root)"
    echo "  REMOTE_PATH     - Deployment path (default: /mnt/user/appdata/batalj)"
    echo ""
    echo "Examples:"
    echo "  $0 192.168.1.100 deploy"
    echo "  $0 unraid.local start"
    echo "  REMOTE_USER=admin $0 192.168.1.100 deploy"
    exit 1
}

# Check if server address is provided
if [ -z "$SERVER" ]; then
    print_message "$RED" "Error: Server address is required"
    usage
fi

# Validate action
if [[ ! "$ACTION" =~ ^(deploy|start|stop|restart|logs|status|cleanup)$ ]]; then
    print_message "$RED" "Error: Invalid action '$ACTION'"
    usage
fi

# SSH connection test
print_message "$BLUE" "Testing connection to $REMOTE_USER@$SERVER..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "$REMOTE_USER@$SERVER" exit 2>/dev/null; then
    print_message "$RED" "Error: Cannot connect to $SERVER"
    print_message "$YELLOW" "Make sure SSH key authentication is set up:"
    print_message "$YELLOW" "  ssh-copy-id $REMOTE_USER@$SERVER"
    exit 1
fi
print_message "$GREEN" "Connection successful!"

# Execute action
case $ACTION in
    deploy)
        print_message "$BLUE" "Deploying $PROJECT_NAME to $SERVER..."

        # Create remote directory
        print_message "$YELLOW" "Creating remote directory..."
        ssh "$REMOTE_USER@$SERVER" "mkdir -p $REMOTE_PATH"

        # Sync files to server (excluding node_modules, .git, etc)
        print_message "$YELLOW" "Syncing files to server..."
        rsync -avz --delete \
            --exclude 'node_modules' \
            --exclude '.git' \
            --exclude '.vscode' \
            --exclude '.idea' \
            --exclude 'dist' \
            --exclude '*.log' \
            --exclude 'webapp/.vscode' \
            ./ "$REMOTE_USER@$SERVER:$REMOTE_PATH/"

        # Check if .env exists, if not copy from example
        print_message "$YELLOW" "Checking environment configuration..."
        ssh "$REMOTE_USER@$SERVER" "
            cd $REMOTE_PATH
            if [ ! -f .env ]; then
                echo 'Creating .env from .env.example...'
                cp .env.example .env
                echo 'Please edit .env file with your configuration!'
            fi
        "

        # Detect and use correct docker compose command
        print_message "$YELLOW" "Building and starting services..."
        ssh "$REMOTE_USER@$SERVER" "
            cd $REMOTE_PATH
            if docker compose version &> /dev/null; then
                DOCKER_COMPOSE='docker compose'
            elif command -v docker-compose &> /dev/null; then
                DOCKER_COMPOSE='docker-compose'
            else
                echo 'Error: Neither docker compose nor docker-compose found'
                exit 1
            fi
            \$DOCKER_COMPOSE down
            \$DOCKER_COMPOSE up -d --build
        "

        print_message "$GREEN" "Deployment successful!"
        print_message "$YELLOW" "Configure your nginx reverse proxy to point to port 7701"
        print_message "$YELLOW" "Application will be available at: https://bk.familjensjolin.com"
        ;;

    start)
        print_message "$YELLOW" "Starting services on $SERVER..."
        ssh "$REMOTE_USER@$SERVER" "
            cd $REMOTE_PATH
            if docker compose version &> /dev/null; then
                docker compose up -d
            else
                docker-compose up -d
            fi
        "
        print_message "$GREEN" "Services started!"
        ;;

    stop)
        print_message "$YELLOW" "Stopping services on $SERVER..."
        ssh "$REMOTE_USER@$SERVER" "
            cd $REMOTE_PATH
            if docker compose version &> /dev/null; then
                docker compose down
            else
                docker-compose down
            fi
        "
        print_message "$GREEN" "Services stopped!"
        ;;

    restart)
        print_message "$YELLOW" "Restarting services on $SERVER..."
        ssh "$REMOTE_USER@$SERVER" "
            cd $REMOTE_PATH
            if docker compose version &> /dev/null; then
                docker compose restart
            else
                docker-compose restart
            fi
        "
        print_message "$GREEN" "Services restarted!"
        ;;

    logs)
        print_message "$YELLOW" "Showing logs from $SERVER (Ctrl+C to exit)..."
        ssh "$REMOTE_USER@$SERVER" "
            cd $REMOTE_PATH
            if docker compose version &> /dev/null; then
                docker compose logs -f
            else
                docker-compose logs -f
            fi
        "
        ;;

    status)
        print_message "$YELLOW" "Service status on $SERVER:"
        ssh "$REMOTE_USER@$SERVER" "
            cd $REMOTE_PATH
            if docker compose version &> /dev/null; then
                docker compose ps
            else
                docker-compose ps
            fi
        "
        ;;

    cleanup)
        print_message "$YELLOW" "Cleaning up old images and containers on $SERVER..."
        ssh "$REMOTE_USER@$SERVER" "
            docker system prune -f
            docker image prune -a -f
        "
        print_message "$GREEN" "Cleanup complete!"
        ;;
esac
