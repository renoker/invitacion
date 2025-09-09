# Guía de Despliegue en AWS Ubuntu

## 1. Configuración de Base de Datos

### Opción A: MySQL Local en Ubuntu
```bash
# Instalar MySQL
sudo apt update
sudo apt install mysql-server

# Configurar MySQL
sudo mysql_secure_installation

# Crear usuario y base de datos
sudo mysql -u root -p
```

En MySQL:
```sql
CREATE USER 'tnb'@'localhost' IDENTIFIED BY 'tnb';
CREATE DATABASE invitacion;
GRANT ALL PRIVILEGES ON invitacion.* TO 'tnb'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Opción B: AWS RDS (Recomendado)
1. Crear instancia RDS MySQL
2. Configurar Security Groups
3. Obtener endpoint de conexión

## 2. Variables de Entorno

Crear archivo `.env` en el servidor:
```bash
# Para MySQL local
DB_HOST=localhost
DB_USER=tnb
DB_PASSWORD=tnb
DB_NAME=invitacion
DB_PORT=3306

# Para AWS RDS
# DB_HOST=tu-endpoint-rds.region.rds.amazonaws.com
# DB_USER=admin
# DB_PASSWORD=tu-password-seguro
# DB_NAME=invitacion
# DB_PORT=3306

PORT=3000
NODE_ENV=production
```

## 3. Instalación y Configuración

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 para gestión de procesos
sudo npm install -g pm2

# Navegar al directorio del proyecto
cd /ruta/a/tu/proyecto/server

# Instalar dependencias
npm install

# Crear archivo .env con las variables de entorno
nano .env

# Iniciar con PM2
pm2 start server.js --name "invitacion-app"

# Configurar PM2 para reinicio automático
pm2 startup
pm2 save
```

## 4. Configuración de Nginx (Opcional)

```bash
# Instalar Nginx
sudo apt install nginx

# Configurar proxy reverso
sudo nano /etc/nginx/sites-available/invitacion
```

Configuración de Nginx:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
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

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/invitacion /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5. Verificación

```bash
# Ver logs de la aplicación
pm2 logs invitacion-app

# Ver estado de PM2
pm2 status

# Verificar conexión a base de datos
curl http://localhost:3000/health

# Verificar panel de administración
curl http://localhost:3000/admin
```

## 6. Troubleshooting

### Error de conexión a base de datos:
1. Verificar que MySQL esté corriendo: `sudo systemctl status mysql`
2. Verificar credenciales en `.env`
3. Verificar que el puerto 3306 esté abierto
4. Revisar logs: `pm2 logs invitacion-app`

### Error de permisos:
```bash
# Dar permisos al usuario
sudo chown -R $USER:$USER /ruta/a/tu/proyecto
```

### Error de puerto:
```bash
# Verificar qué está usando el puerto 3000
sudo netstat -tlnp | grep :3000
```
