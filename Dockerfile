# ============================================================================
# Guruvayur Dham — Production Dockerfile
# ============================================================================
# Multi-stage build:
#   1. deps     — install dependencies (cached layer)
#   2. builder  — build the Next.js standalone app
#   3. runner   — minimal final image (no node_modules, no dev deps)
# ============================================================================

FROM node:20-alpine AS deps
WORKDIR /app

# Install system dependencies needed for sharp (image processing)
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json bun.lock* yarn.lock* package-lock.json* ./

# Install dependencies (use npm for compatibility)
RUN npm ci || npm install

# ---- Builder stage ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set NEXT_TELEMETRY_DISABLED to avoid build-time telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the app. The build script runs `prisma generate` via postinstall.
# DATABASE_URL is needed at build time for Prisma client generation.
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npm run build

# ---- Runner stage (minimal final image) ----
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create uploads directory (persistent volume mount point)
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
