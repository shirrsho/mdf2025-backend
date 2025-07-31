FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
RUN npm i -g pnpm@9.15.4

FROM base AS dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

FROM base AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules/ ./node_modules/
ENV NODE_ENV=production
RUN pnpm build

FROM base AS deploy

WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
RUN mkdir -p /app/uploads 
RUN chown nestjs /app/uploads 
USER nestjs

COPY --from=build --chown=nestjs:nodejs /app/package.json ./
COPY --from=build --chown=nestjs:nodejs /app/dist/ ./dist/
COPY --from=build --chown=nestjs:nodejs /app/node_modules/ ./node_modules/

CMD [ "pnpm", "run", "start:prod" ]