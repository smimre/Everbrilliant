# ══════════════════════════════════════════════════════════════
# EVERBRILLIANT API — Multi-stage Dockerfile
# ══════════════════════════════════════════════════════════════

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ── Dependencies ────────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
RUN npm ci --frozen-lockfile

# ── Builder ──────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ── Runner ───────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs \
 && adduser  -S nestjs -u 1001

COPY --from=builder --chown=nestjs:nodejs /app/dist         ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nestjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "dist/main"]
