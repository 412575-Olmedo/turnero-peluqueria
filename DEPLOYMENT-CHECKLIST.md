# ✅ Checklist de Despliegue en DonWeb

## 📋 Pre-Despliegue

### Configuración Local
- [ ] Proyecto clonado o descargado
- [ ] Docker y Docker Compose instalados
- [ ] Archivo `.env` creado desde `.env.example`
- [ ] Variables de entorno configuradas correctamente

### Seguridad
- [ ] `POSTGRES_PASSWORD` cambiada (contraseña fuerte)
- [ ] `JWT_SECRET` generado (64+ caracteres aleatorios)
- [ ] `DB_PASSWORD` configurada (igual a POSTGRES_PASSWORD)
- [ ] Contraseñas diferentes a las de ejemplo

### Configuración de Producción
- [ ] `API_URL` configurada con el dominio correcto
- [ ] `NGINX_HOST` configurado con el dominio
- [ ] Puertos externos configurados según DonWeb
- [ ] `SPRING_PROFILES_ACTIVE=prod` en .env

### Código
- [ ] Última versión del código obtenida (git pull)
- [ ] Dependencias actualizadas (npm install, mvn clean install)
- [ ] Tests ejecutados y pasando
- [ ] Sin errores de compilación

## 🚀 Durante el Despliegue

### Acceso al Servidor
- [ ] Acceso SSH al servidor DonWeb configurado
- [ ] Usuario con permisos de Docker
- [ ] Directorio de proyecto creado

### Subida de Archivos
- [ ] Código subido al servidor (git clone o SFTP)
- [ ] Archivo `.env` copiado al servidor
- [ ] Permisos correctos en scripts (.sh ejecutables)

### Construcción
- [ ] Imágenes Docker construidas sin errores
- [ ] Contenedores iniciados correctamente
- [ ] Health checks pasando (verde)

### Verificación
- [ ] Base de datos creada y accesible
- [ ] Backend respondiendo (health endpoint)
- [ ] Frontend cargando correctamente
- [ ] API conectándose al backend

## ✔️ Post-Despliegue

### Verificación Funcional
- [ ] Página de inicio carga correctamente
- [ ] Login funciona
- [ ] APIs responden correctamente
- [ ] Swagger UI accesible y funcional
- [ ] Base de datos persistiendo datos

### Seguridad
- [ ] Firewall configurado (solo puertos necesarios)
- [ ] HTTPS/SSL configurado (si aplica)
- [ ] Archivo `.env` NO está en el repositorio git
- [ ] Credenciales seguras en producción

### Monitoreo
- [ ] Logs accesibles y sin errores críticos
- [ ] Health checks configurados
- [ ] Backups automáticos configurados
- [ ] Alertas configuradas (opcional)

### Documentación
- [ ] URLs de producción documentadas
- [ ] Credenciales guardadas en lugar seguro
- [ ] Procedimientos de backup documentados
- [ ] Contactos de soporte anotados

## 🔍 Comandos de Verificación

```bash
# Estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Health check del backend
curl http://localhost:8080/actuator/health

# Verificar que el frontend responde
curl http://localhost

# Ver logs
docker-compose -f docker-compose.prod.yml logs --tail=50

# Ver recursos utilizados
docker stats --no-stream
```

## 🗄️ Configuración de Backups

### Backup Manual
- [ ] Script de backup probado (`./backup-db.sh`)
- [ ] Directorio de backups creado (`./backups/`)
- [ ] Backup inicial creado y verificado

### Backup Automático
- [ ] Crontab configurado para backups diarios
- [ ] Rotación de backups configurada
- [ ] Almacenamiento externo configurado (opcional)

```bash
# Configurar backup diario a las 2 AM
crontab -e
# Agregar: 0 2 * * * cd /ruta/proyecto && ./backup-db.sh
```

## 🌐 Configuración de Dominio

- [ ] DNS apuntando al servidor
- [ ] Dominio resolviendo correctamente
- [ ] API_URL actualizada con el dominio
- [ ] NGINX_HOST configurado
- [ ] Certificado SSL instalado (si aplica)

## 📊 Monitoreo Continuo

### Primera Semana
- [ ] Revisar logs diariamente
- [ ] Verificar uso de recursos
- [ ] Confirmar que backups se crean
- [ ] Monitorear rendimiento

### Mantenimiento Regular
- [ ] Actualizaciones de seguridad aplicadas
- [ ] Logs antiguos rotados/eliminados
- [ ] Backups verificados mensualmente
- [ ] Recursos monitoreados

## 🆘 Plan de Contingencia

- [ ] Procedimiento de rollback documentado
- [ ] Backup más reciente verificado
- [ ] Contactos de soporte anotados
- [ ] Procedimiento de restauración probado

## 📝 Notas

### Información del Servidor
```
Proveedor: DonWeb
IP: ___________________
Dominio: ___________________
Usuario SSH: ___________________
Puerto SSH: ___________________
```

### URLs de Producción
```
Frontend: ___________________
Backend: ___________________
Swagger: ___________________
Base de Datos: ___________________
```

### Credenciales (guardar en lugar seguro)
```
DB User: ___________________
DB Password: ___________________
JWT Secret: ___________________
```

### Fechas Importantes
```
Fecha de despliegue: ___________________
Próxima actualización: ___________________
Último backup: ___________________
```

---

## ✅ Firma de Aprobación

- [ ] Desarrollo aprueba
- [ ] Testing completado
- [ ] Producción verificada
- [ ] Cliente notificado

**Responsable del despliegue:** ___________________
**Fecha:** ___________________
**Firma:** ___________________

---

**Nota:** Marca cada checkbox ✅ a medida que completas cada paso.
