# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache optimization)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source files
COPY src/ ./src/

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: create non-root user
RUN addgroup -g 1001 -S careerpilot && \
    adduser -S -u 1001 -G careerpilot careerpilot

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder --chown=careerpilot:careerpilot /app/node_modules ./node_modules
COPY --from=builder --chown=careerpilot:careerpilot /app/src ./src
COPY --chown=careerpilot:careerpilot package.json ./

# Switch to non-root user
USER careerpilot

# Cloud Run standard port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

# Start server
CMD ["node", "src/app.js"]
