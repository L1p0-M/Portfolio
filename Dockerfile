FROM nginx:alpine

RUN apk add --no-cache tini curl

RUN rm -rf /etc/nginx/conf.d/default.conf && \
    mkdir -p /etc/nginx/conf.d

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY html/ /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

RUN chown -R nginx:nginx /etc/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /run \
    && chown -R nginx:nginx /usr/share/nginx

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=60s --timeout=3s CMD curl -fs http://localhost:8080/ || exit 1

ENTRYPOINT ["tini", "--"]
CMD ["nginx", "-g", "daemon off;"]
