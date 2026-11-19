# Образ сайта (спека 0002, ADR 0005): сборка статики и nginx без root, который её отдаёт.
#   docker build --build-arg VERSION=0.1.0 -t atomic-tasks-web .
# Node — та же мажорная версия, что в .node-version; pnpm — из packageManager в package.json.

FROM node:26-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# В Node 26 нет corepack: ставим pnpm ровно той версии, что закреплена в packageManager
RUN npm install -g "$(node -p 'require("./package.json").packageManager')" \
 && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
# Версия — после сборки: её смена не сбрасывает кэш установки и сборки
ARG VERSION=0.0.0-dev
RUN test -n "$VERSION" && printf '%s\n' "$VERSION" > dist/version.txt

FROM nginxinc/nginx-unprivileged:1.30-alpine
# Убрать страницы-примеры базового образа (index.html, 50x.html): отдаём только dist/
USER root
RUN rm -rf /usr/share/nginx/html/*
USER 101
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY deploy/nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
