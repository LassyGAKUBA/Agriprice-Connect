FROM node:20-alpine AS builder

WORKDIR /app

COPY public/ ./public/

FROM nginx:alpine AS production

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/public/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
# Nginx starts automatically so no CMD needed just in case
