# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies required for building (including Python for node-gyp)
RUN apk add --no-cache libc6-compat openssl python3 make g++

# Copy package files
COPY package.json package-lock.json* ./

# Clean install
RUN npm cache clean --force && \
    npm install --verbose || npm install --legacy-peer-deps --verbose

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client with dummy DATABASE_URL
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Copy application code
COPY . .

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy package.json for prisma
COPY --from=builder /app/package*.json ./

# Install only prisma (for migrations)
RUN npm install prisma --save-dev

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Run migrations and start app
CMD npx prisma migrate deploy && node server.js
