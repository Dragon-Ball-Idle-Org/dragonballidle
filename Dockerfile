# PNPM build
FROM node:24-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

# FROM builder AS prod-deps
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM builder AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# PHP Apache Server
FROM php:8.2-apache

# Habilita módulos necessários do Apache e extensões comuns do PHP
RUN a2enmod rewrite \
  && docker-php-ext-install pdo pdo_mysql

WORKDIR /var/www/html

# Copia o dist gerado no stage anterior (sem precisar buildar localmente)
# COPY --from=prod-deps /app/node_modules /var/www/html/node_modules
COPY --from=build /app/dist/ /var/www/html/

COPY api/ /var/www/html/api/

# Permissões adequadas para o Apache
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]