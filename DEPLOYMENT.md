# 🚀 Guía de Despliegue - Sistema de Invitaciones

## 📋 Resumen de Cambios para Producción

### ✅ **Problema Solucionado**
- **Antes**: URLs hardcodeadas a `localhost:3000` que fallaban en producción
- **Después**: URLs dinámicas que se adaptan automáticamente al dominio de producción

### 🔧 **Archivos Modificados**

1. **`config.js`** (NUEVO) - Configuración dinámica de URLs
2. **`script.js`** - Actualizado para usar URLs dinámicas
3. **`index.html`** - Incluye config.js
4. **`admin.html`** - Incluye config.js y URLs dinámicas
5. **`no-asistensia.html`** - Incluye config.js

## 🌐 **Cómo Funciona la Configuración**

### **Desarrollo (localhost)**
```javascript
// Automáticamente detecta localhost y usa:
http://localhost:3000/api/rsvp
```

### **Producción (cualquier dominio)**
```javascript
// Automáticamente usa el mismo dominio:
https://tudominio.com/api/rsvp
https://mi-servidor.com:8080/api/rsvp
```

## 📦 **Pasos para Despliegue**

### 1. **Subir Archivos**
```bash
# Subir todos los archivos al servidor
# Asegúrate de incluir:
- config.js (NUEVO)
- script.js (actualizado)
- index.html (actualizado)
- admin.html (actualizado)
- no-asistensia.html (actualizado)
- server/ (directorio completo)
```

### 2. **Configurar Variables de Entorno**
```bash
# En el servidor, crear archivo .env en server/
cd server/
cp env.example .env

# Editar .env con datos de producción:
DB_HOST=tu-servidor-mysql.com
DB_USER=tu-usuario
DB_PASSWORD=tu-password
DB_NAME=invitacion
DB_PORT=3306
NODE_ENV=production
```

### 3. **Instalar Dependencias**
```bash
cd server/
npm install --production
```

### 4. **Iniciar Servidor**
```bash
# Opción 1: Directo
npm start

# Opción 2: Con PM2 (recomendado)
npm install -g pm2
pm2 start server.js --name "invitacion-app"
pm2 startup
pm2 save
```

### 5. **Configurar Proxy/Reverse Proxy**

#### **Con Nginx:**
```nginx
server {
    listen 80;
    server_name tudominio.com;
    
    # Servir archivos estáticos
    location / {
        root /ruta/a/tu/proyecto;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy para API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### **Con Apache:**
```apache
<VirtualHost *:80>
    ServerName tudominio.com
    DocumentRoot /ruta/a/tu/proyecto
    
    # Proxy para API
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3000/api/
    ProxyPassReverse /api/ http://localhost:3000/api/
</VirtualHost>
```

## 🔍 **Verificación Post-Despliegue**

### 1. **Verificar URLs Dinámicas**
```bash
# Abrir consola del navegador en tu dominio
# Ejecutar:
console.log(getApiBaseUrl());
// Debería mostrar: https://tudominio.com
```

### 2. **Probar Endpoints**
```bash
# Verificar que la API funciona
curl https://tudominio.com/health
curl https://tudominio.com/health/db
```

### 3. **Probar Formulario**
- Llenar y enviar el formulario de RSVP
- Verificar que se guarda en la base de datos
- Revisar el panel de administración

## 🛠️ **Comandos Útiles**

### **Verificar Base de Datos**
```bash
cd server/
npm run check-db    # Verificación completa
npm run quick-db    # Verificación rápida
```

### **Monitorear Logs**
```bash
# Si usas PM2
pm2 logs invitacion-app

# Si usas systemd
journalctl -u tu-servicio -f
```

## ⚠️ **Consideraciones Importantes**

1. **HTTPS**: Configura SSL/TLS para producción
2. **Firewall**: Abre puerto 3000 solo para el proxy
3. **Base de Datos**: Asegúrate de que MySQL esté accesible
4. **Backup**: Configura respaldos automáticos de la BD
5. **Monitoreo**: Implementa alertas de caídas del servicio

## 🆘 **Solución de Problemas**

### **Error: "No se pudo conectar con el servidor"**
- Verificar que el servidor Node.js esté corriendo
- Revisar logs del servidor
- Confirmar configuración del proxy

### **Error: "Error de conexión a la base de datos"**
- Ejecutar `npm run check-db` para diagnóstico
- Verificar variables de entorno
- Confirmar que MySQL esté accesible

### **Error: "Endpoint no encontrado"**
- Verificar configuración del proxy
- Confirmar que las rutas estén bien configuradas
- Revisar logs del servidor web

## 📞 **Soporte**

Si tienes problemas con el despliegue, revisa:
1. Logs del servidor Node.js
2. Logs del servidor web (Nginx/Apache)
3. Estado de la base de datos
4. Configuración de firewall
