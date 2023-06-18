# Stage 2: Serve app with nginx server
FROM nginx:latest

COPY dist/apps/web /etc/nginx/html

COPY apps/web/nginx-conf/default.conf /etc/nginx/conf.d/default.conf
COPY apps/web/src/favicon.ico /etc/nginx/html/favicon.ico
COPY apps/web/nginx-conf/*.sh /docker-entrypoint.d

# Expose port 80
EXPOSE 80
ENV APP_BASE_HREF="/replacemebasehref"
ENV TARGET_BASE_PATH=""