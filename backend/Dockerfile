# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build TypeScript
RUN npm run ts

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built JavaScript from build stage
COPY --from=build /app/*.js ./
COPY --from=build /app/routers ./routers
COPY --from=build /app/models ./models
COPY --from=build /app/db ./db
COPY --from=build /app/websockets ./websockets
COPY --from=build /app/utils ./utils
COPY --from=build /app/public ./public

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
