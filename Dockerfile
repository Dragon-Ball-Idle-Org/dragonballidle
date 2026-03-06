# PNPM build
FROM node:24-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY . /app
FROM builder AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# PHP Apache Server
FROM php:8.2-apache
# Habilita módulos necessários do Apache e extensões comuns do PHP
RUN a2enmod rewrite \
  && a2enmod headers \
  && docker-php-ext-install pdo pdo_mysql
# Habilita AllowOverride para o .htaccess funcionar
RUN echo '<Directory /var/www/html>\n\
  AllowOverride All\n\
  Require all granted\n\
  </Directory>' >> /etc/apache2/apache2.conf
WORKDIR /var/www/html
# Copia o dist gerado no stage anterior (sem precisar buildar localmente)
COPY --from=build /app/dist/ /var/www/html/
COPY api/ /var/www/html/api/
# Copia o .htaccess do projeto (já contém todas as regras de i18n e SPA)
COPY .htaccess /var/www/html/.htaccess
# Permissões adequadas para o Apache
RUN chown -R www-data:www-data /var/www/html
EXPOSE 80
CMD ["apache2-foreground"]