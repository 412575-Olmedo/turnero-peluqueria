#!/bin/sh

# Script de entrypoint para inyectar variables de entorno en tiempo de ejecución

# Valores por defecto
export NGINX_PORT="${NGINX_PORT:-80}"
export NGINX_HOST="${NGINX_HOST:-localhost}"
export API_URL="${API_URL:-http://localhost:8080/api}"

echo "🚀 Iniciando aplicación frontend..."
echo "📝 Configuración:"
echo "   - NGINX_PORT: $NGINX_PORT"
echo "   - NGINX_HOST: $NGINX_HOST"
echo "   - API_URL: $API_URL"

# Crear archivo de configuración con variables de entorno
envsubst '${NGINX_PORT} ${NGINX_HOST} ${API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Crear archivo env-config.js con la URL de la API para que Angular lo use
cat > /usr/share/nginx/html/env-config.js <<EOF
(function(window) {
  window.__env = window.__env || {};
  window.__env.apiUrl = '${API_URL}';
  window.__env.production = true;
}(this));
EOF

echo "✅ Configuración completada"

# Ejecutar el comando pasado como argumentos
exec "$@"
