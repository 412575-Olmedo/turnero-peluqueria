# 📖 Índice de Documentación - Turnero Peluquería

## 🚀 Para Empezar

Si es tu primera vez desplegando, comienza aquí:

1. **[QUICK-START-DONWEB.md](./QUICK-START-DONWEB.md)** ⭐ COMIENZA AQUÍ
   - Despliegue rápido en 3 pasos
   - Configuración básica
   - Comandos esenciales

2. **[DOCKERIZATION-SUMMARY.md](./DOCKERIZATION-SUMMARY.md)**
   - Resumen de todos los archivos creados
   - Arquitectura de contenedores
   - Próximos pasos

## 🐳 Guías de Docker

3. **[DOCKER-GUIDE.md](./DOCKER-GUIDE.md)**
   - Guía completa de dockerización
   - Todos los comandos útiles
   - Gestión de servicios y debugging

4. **[DEPLOYMENT-DONWEB.md](./DEPLOYMENT-DONWEB.md)**
   - Guía paso a paso para DonWeb
   - Configuración de servidor
   - Solución de problemas específicos

5. **[DONWEB-PANEL-GUIDE.md](./DONWEB-PANEL-GUIDE.md)** ⭐ NUEVO
   - Configuración desde el panel de DonWeb
   - Paso a paso con interfaz gráfica
   - No requiere conocimientos de terminal

## ⚙️ Configuración

6. **[ENV-VARIABLES-GUIDE.md](./ENV-VARIABLES-GUIDE.md)**
   - Todas las variables de entorno explicadas
   - Generadores de claves seguras
   - Mejores prácticas de seguridad

7. **[.env.example](./.env.example)**
   - Plantilla de variables de entorno
   - Copiar a `.env` y personalizar

## ✅ Verificación y Mantenimiento

8. **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)**
   - Lista completa de verificación
   - Pre-despliegue, despliegue y post-despliegue
   - Configuración de backups

## 📋 Documentación del Proyecto

9. **[README.md](./README.md)**
   - Descripción general del proyecto
   - Características principales
   - Estructura del proyecto

10. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
    - Arquitectura técnica
    - Diagramas de componentes
    - Decisiones de diseño

11. **[BEST-PRACTICES.md](./BEST-PRACTICES.md)**
    - Mejores prácticas de desarrollo
    - Estándares de código
    - Convenciones

12. **[DEPLOYMENT.md](./DEPLOYMENT.md)**
    - Guía general de despliegue
    - Comandos Docker Compose
    - Acceso a servicios

## 🗂️ Scripts

### Scripts de Despliegue

- **[deploy-donweb.sh](./deploy-donweb.sh)** - Linux/Mac
- **[deploy-donweb.bat](./deploy-donweb.bat)** - Windows CMD
- **[deploy-donweb.ps1](./deploy-donweb.ps1)** - Windows PowerShell

### Scripts de Mantenimiento

- **[backup-db.sh](./backup-db.sh)** - Backup de base de datos

## 🔧 Archivos de Configuración

### Docker

- **[docker-compose.yml](./docker-compose.yml)** - Desarrollo local
- **[docker-compose.prod.yml](./docker-compose.prod.yml)** - Producción
- **[front/Dockerfile](./front/Dockerfile)** - Imagen del frontend
- **[initial-scaffolding/Dockerfile](./initial-scaffolding/Dockerfile)** - Imagen del backend

### Nginx

- **[front/nginx.conf](./front/nginx.conf)** - Configuración de Nginx
- **[front/docker-entrypoint.sh](./front/docker-entrypoint.sh)** - Script de inicialización

### Spring Boot

- **[initial-scaffolding/src/main/resources/application.properties](./initial-scaffolding/src/main/resources/application.properties)** - Configuración base
- **[initial-scaffolding/src/main/resources/application-prod.properties](./initial-scaffolding/src/main/resources/application-prod.properties)** - Configuración de producción

### Base de Datos

- **[init-db.sql](./init-db.sql)** - Script de inicialización de PostgreSQL

## 📚 Por Caso de Uso

### Caso 1: Primera vez desplegando en DonWeb
1. [QUICK-START-DONWEB.md](./QUICK-START-DONWEB.md)
2. [DONWEB-PANEL-GUIDE.md](./DONWEB-PANEL-GUIDE.md) (si prefieres usar el panel web)
3. [ENV-VARIABLES-GUIDE.md](./ENV-VARIABLES-GUIDE.md)
4. [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)

### Caso 2: Configurar variables de entorno
1. [ENV-VARIABLES-GUIDE.md](./ENV-VARIABLES-GUIDE.md)
2. [.env.example](./.env.example)

### Caso 3: Actualizar la aplicación
1. [DOCKER-GUIDE.md](./DOCKER-GUIDE.md) → Sección "Actualizaciones"
2. [DEPLOYMENT-DONWEB.md](./DEPLOYMENT-DONWEB.md) → Sección "Actualizaciones"

### Caso 4: Hacer backup de la base de datos
1. [DOCKER-GUIDE.md](./DOCKER-GUIDE.md) → Sección "Gestión de Base de Datos"
2. Ejecutar: `./backup-db.sh`

### Caso 5: Solucionar problemas
1. [DOCKER-GUIDE.md](./DOCKER-GUIDE.md) → Sección "Solución de Problemas"
2. [DEPLOYMENT-DONWEB.md](./DEPLOYMENT-DONWEB.md) → Sección "Solución de Problemas"

### Caso 6: Entender la arquitectura
1. [DOCKERIZATION-SUMMARY.md](./DOCKERIZATION-SUMMARY.md) → Arquitectura de Contenedores
2. [ARCHITECTURE.md](./ARCHITECTURE.md)

### Caso 7: Configurar monitoreo
1. [DOCKER-GUIDE.md](./DOCKER-GUIDE.md) → Sección "Monitoreo"
2. [DEPLOYMENT-DONWEB.md](./DEPLOYMENT-DONWEB.md) → Sección "Monitoreo y Mantenimiento"

## 🎯 Flujo de Trabajo Recomendado

```
1. QUICK-START-DONWEB.md
   ↓
2. ENV-VARIABLES-GUIDE.md (configurar .env)
   ↓
3. Ejecutar deploy-donweb.sh
   ↓
4. DEPLOYMENT-CHECKLIST.md (verificar)
   ↓
5. DOCKER-GUIDE.md (para operaciones diarias)
```

## 🆘 Soporte

Si necesitas ayuda:

1. **Revisa la documentación** en este orden:
   - [QUICK-START-DONWEB.md](./QUICK-START-DONWEB.md)
   - [DOCKER-GUIDE.md](./DOCKER-GUIDE.md) → Solución de Problemas
   - [DEPLOYMENT-DONWEB.md](./DEPLOYMENT-DONWEB.md) → Solución de Problemas

2. **Recursos externos:**
   - Docker Docs: https://docs.docker.com/
   - Spring Boot Docs: https://spring.io/guides
   - Angular Docs: https://angular.io/docs
   - PostgreSQL Docs: https://www.postgresql.org/docs/

3. **Soporte de DonWeb:**
   - Centro de ayuda de DonWeb
   - Soporte técnico

## 📝 Notas

- Todos los archivos `.md` son archivos Markdown que puedes leer con cualquier editor
- Los scripts `.sh` son para Linux/Mac (requieren `chmod +x` antes de ejecutar)
- Los scripts `.bat` y `.ps1` son para Windows
- El archivo `.env` NUNCA debe subirse al repositorio (está en `.gitignore`)

---

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Proyecto:** Sistema de Turnos para Peluquería
