# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:24-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json tsconfig.prod.json ./
COPY bin/ ./bin/
COPY src/ ./src/

RUN npm run build-prod

# ── Production stage ─────────────────────────────────────────────────────────
FROM node:24-slim AS production

ENV NODE_ENV=production
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled TypeScript output
COPY --from=builder /app/dist ./dist

USER node

EXPOSE 8080

CMD ["node", "dist/index.js"]
