FROM nginx:alpine

ARG API_BASE_URL=http://localhost:3040
ENV API_BASE_URL=$API_BASE_URL

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]