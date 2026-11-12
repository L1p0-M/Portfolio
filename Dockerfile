FROM nginx:1.31.8-alpine

RUN apk add --no-cache tini

RUN rm -rf /etc/nginx/conf.d/default.conf && \
    mkdir -p /etc/nginx/conf.d

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY html/ /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
COPY assets/images/favicon.ico /usr/share/nginx/html/favicon.ico
COPY includes/ /usr/share/nginx/html/includes/

RUN chown -R nginx:nginx /var/cache/nginx
RUN sed -i -e 's#/run/nginx.pid#/tmp/nginx.pid#' \
           -e '/^user /d' /etc/nginx/nginx.conf

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=60s --timeout=3s CMD wget -qO- http://localhost:8080/ || exit 1

ENTRYPOINT ["tini", "--"]
CMD ["nginx", "-g", "daemon off;"]
