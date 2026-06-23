# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies
RUN pnpm install 

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install only production dependencies
RUN pnpm install  --prod

# Copy built files from builder
COPY --from=builder /app/dist ./dist
# Copy drizzle files for migrations
COPY drizzle ./drizzle
COPY drizzle.config.json ./drizzle.config.json

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
