FROM node:24-alpine

WORKDIR /app

RUN corepack enable

ENV CI=true

COPY . .

RUN pnpm install --frozen-lockfile

EXPOSE 3000