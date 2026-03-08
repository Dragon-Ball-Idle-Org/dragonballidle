# PNPM build
FROM node:24-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY . /app

FROM builder AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# Nginx + Certbot
FROM nginx:1.28.2-alpine
RUN apk add --no-cache certbot certbot-nginx

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.dev.conf /etc/nginx/conf.d/nginx.dev.conf

ARG ENV=development
RUN if [ "$ENV" = "development" ]; then \
  cp /etc/nginx/conf.d/nginx.dev.conf /etc/nginx/conf.d/default.conf; \
  fi

# Remove o arquivo dev para o Nginx não carregar os dois
RUN rm /etc/nginx/conf.d/nginx.dev.conf

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]