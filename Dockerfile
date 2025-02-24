FROM node:lts-alpine3.18 AS base
RUN apk add --no-cache graphicsmagick git
WORKDIR /app

FROM base AS pnpm_base
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install --global corepack@latest
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM pnpm_base AS pnpm_cache
COPY ./backend/package.json ./backend/
COPY ./frontend/package.json ./frontend/
RUN pnpm install

FROM pnpm_cache AS backend_production_dependencies
WORKDIR /app/backend
RUN pnpm prune --prod

FROM pnpm_cache AS backend_builder
WORKDIR /app/backend
COPY ./backend .
RUN pnpm prettier && \
    pnpm lint && \
    pnpm test && \
    pnpm build

FROM pnpm_cache AS frontend_builder
WORKDIR /app/frontend
COPY ./frontend .
RUN pnpm prettier && \
    pnpm lint && \
    pnpm build

FROM base
ENV NODE_ENV=production
COPY --from=backend_production_dependencies /app/node_modules ./node_modules
COPY --from=backend_builder /app/backend/dist ./backend/dist
COPY --from=frontend_builder /app/frontend/dist ./frontend/dist

EXPOSE 3000

ENTRYPOINT ["node", "/app/backend/dist/index.js"]
