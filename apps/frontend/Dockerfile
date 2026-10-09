FROM nginxinc/nginx-unprivileged:alpine3.23

WORKDIR /app

ARG API_BASE_URL
ENV API_BASE_URL=$API_BASE_URL

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/frontend/public/ /usr/share/nginx/html/

USER root
RUN echo "window.APP_CONFIG = { \
  API_BASE_URL: '$API_BASE_URL', \
};" > /usr/share/nginx/html/config.js && \
    chown nginx:nginx /usr/share/nginx/html

USER nginx

EXPOSE 80

CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]