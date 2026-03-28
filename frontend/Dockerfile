FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/ ./frontend/

FROM nginx:alpine AS production

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/frontend/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80