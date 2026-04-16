# Etapa 1: Build de Angular
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para compilar)
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build -- --configuration production

# Etapa 2: Nginx para servir la aplicación
FROM nginx:alpine

# Copiar archivos compilados desde la etapa de build
COPY --from=build /app/dist/front/browser /usr/share/nginx/html

# Copiar configuración de nginx (directamente sin templates)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Variables de entorno por defecto
ENV API_URL=http://localhost:8080/api

# Exponer puerto 80
EXPOSE 80

# Comando por defecto de nginx
CMD ["nginx", "-g", "daemon off;"]
