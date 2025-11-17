# Multi-stage Dockerfile for building and running the Next.js application
# Uses Node 20 (Alpine) to keep the image small while supporting modern Next/TS features
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies (including dev deps needed for build)
RUN npm ci --legacy-peer-deps

# Copy the rest of the source
COPY . .

# Build the Next.js app
RUN npm run build


# -----------------------------------------------------------------------------
# Production image
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Set production env
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built assets and necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./next.config.ts

# Copy node_modules from builder to avoid reinstalling
COPY --from=builder /app/node_modules ./node_modules

# Expose default Next port
EXPOSE 3000

# Use the production start script (expects `next start` or similar in package.json)
CMD ["npm", "start"]
