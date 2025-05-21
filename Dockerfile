# syntax=docker/dockerfile:1

ARG NODE_VERSION=24-alpine
ARG PNPM_VERSION=10.4.1

# ---- Base image with corepack and pnpm enabled ----
FROM node:${NODE_VERSION} AS base

# Install corepack and pnpm
RUN apk add --no-cache curl && \
    corepack enable && \
    corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

# ---- Builder stage: install deps and build with tsup ----
FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Setup pnpm cache
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV PNPM_STORE_DIR=/root/.pnpm-store

RUN pnpm install --frozen-lockfile

COPY . .

# Assumes build command runs tsup
RUN pnpm run build

# ---- Production image ----
FROM node:${NODE_VERSION} AS final

# Add corepack and pnpm again (only if needed at runtime)
RUN apk add --no-cache curl && \
    corepack enable && \
    corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "dist/index.js"]

# ---- Development image (optional) ----
FROM base AS dev
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV PNPM_STORE_DIR=/root/.pnpm-store

RUN pnpm install --frozen-lockfile

COPY . .

VOLUME ["/app/src"]
CMD ["pnpm", "run", "dev"]