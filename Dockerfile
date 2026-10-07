FROM nginx:alpine

# Копируем файлы веб-приложения в стандартную директорию Nginx
COPY . /usr/share/nginx/html

# Удаляем Docker-файлы из веб-директории внутри контейнера для чистоты
RUN rm -f /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/docker-compose.yml /usr/share/nginx/html/.dockerignore

# Открываем порт 80
EXPOSE 80

# Запуск Nginx
CMD ["nginx", "-g", "daemon off;"]
