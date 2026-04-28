FROM nginx:alpine

# Copy built app
COPY dist/ /usr/share/nginx/html
COPY src/assets /usr/share/nginx/html/assets
COPY src/pages /usr/share/nginx/html/pages

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80