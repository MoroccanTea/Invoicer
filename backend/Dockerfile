FROM node:18-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create necessary files and set permissions
RUN touch .env && \
    mkdir -p /app && \
    chown -R node:node /app && \
    chmod 755 /app

# Switch to non-root user
USER node

# Ensure the directory exists and is writable
RUN mkdir -p /app/src

EXPOSE 5000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/status || exit 1

# Use node directly with proper signal handling
CMD ["node", "src/index.js"]
