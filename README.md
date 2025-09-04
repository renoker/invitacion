# 🎉 Sistema de Invitaciones RSVP

Sistema completo de invitaciones con formulario RSVP, base de datos MySQL y backend Node.js.

## ✨ Características

- 🎨 **Diseño elegante** replicando exactamente la maqueta proporcionada
- 📱 **Responsive design** para móviles y desktop
- ✅ **Validación de formularios** en tiempo real
- 🗄️ **Base de datos MySQL** para almacenar RSVPs
- 🚀 **API REST** con Express.js
- 📊 **Estadísticas** de invitados y asistentes
- 🗺️ **Integración** con Google Maps y Waze

## 🏗️ Estructura del Proyecto

```
/invitacion
├── index.html          # Vista principal de la invitación
├── styles.css          # Estilos CSS
├── script.js           # Lógica del frontend con Axios
├── server/             # Backend Node.js
│   ├── server.js       # Servidor Express principal
│   ├── config/db.js    # Configuración de MySQL
│   └── package.json    # Dependencias del backend
└── README.md           # Este archivo
```

## 🚀 Instalación y Configuración

### 1. Prerrequisitos

- **Node.js** (versión 16 o superior)
- **MySQL** (versión 8.0 o superior)
- **Git** (opcional)

### 2. Configurar MySQL

```sql
-- Crear usuario (opcional, puedes usar root)
CREATE USER 'invitaciones_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON invitaciones_db.* TO 'invitaciones_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configurar la Base de Datos

Edita el archivo `server/config/db.js` con tus credenciales:

```javascript
const dbConfig = {
    host: 'localhost',
    user: 'root',           // Tu usuario de MySQL
    password: 'tu_password', // Tu contraseña de MySQL
    database: 'invitaciones_db',
    port: 3306
};
```

### 4. Instalar Dependencias del Backend

```bash
cd server
npm install
```

### 5. Iniciar el Servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor se iniciará en `http://localhost:3000`

## 📱 Uso del Sistema

### Frontend
- Abre `index.html` en tu navegador
- El formulario se conectará automáticamente al backend
- Los botones de Google Maps y Waze abrirán la ubicación del evento

### Backend API

#### Endpoints Disponibles:

- **`POST /api/rsvp`** - Registrar nuevo RSVP
- **`GET /api/rsvp`** - Obtener todos los RSVPs
- **`GET /api/stats`** - Estadísticas de invitados
- **`GET /health`** - Estado del servidor

#### Ejemplo de uso con cURL:

```bash
# Registrar RSVP
curl -X POST http://localhost:3000/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@ejemplo.com",
    "telefono": "5512345678",
    "numAsistentes": 2
  }'

# Obtener estadísticas
curl http://localhost:3000/api/stats

# Verificar estado del servidor
curl http://localhost:3000/health
```

## 🗄️ Base de Datos

### Tabla `invitados`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | ID único auto-incremental |
| `nombre` | VARCHAR(100) | Nombre del invitado |
| `apellido` | VARCHAR(100) | Apellido del invitado |
| `email` | VARCHAR(150) | Email (único) |
| `telefono` | VARCHAR(20) | Número de teléfono |
| `num_asistentes` | INT | Número de asistentes (1-10) |
| `fecha_registro` | TIMESTAMP | Fecha y hora de registro |

## 🔧 Personalización

### Cambiar Colores
Edita `styles.css`:
```css
:root {
    --primary-bg: #1a3a4a;      /* Fondo principal */
    --accent-color: #ff6b35;    /* Color naranja */
    --text-color: #ffffff;      /* Texto blanco */
}
```

### Cambiar Información del Evento
Edita `index.html`:
- Título principal
- Nombres de organizadores
- Fecha y hora
- Dirección
- Tipo de evento

### Cambiar Ubicación
Edita `script.js` en las funciones `openGoogleMaps()` y `openWaze()`:
```javascript
const address = 'Tu nueva dirección aquí';
```

## 🐛 Solución de Problemas

### Error de Conexión a MySQL
- Verifica que MySQL esté ejecutándose
- Confirma las credenciales en `server/config/db.js`
- Asegúrate de que el puerto 3306 esté disponible

### Error CORS
- El servidor ya incluye CORS habilitado
- Si persiste, verifica que estés accediendo desde `localhost`

### Formulario no Envía
- Verifica que el servidor esté ejecutándose en puerto 3000
- Revisa la consola del navegador para errores
- Confirma que Axios esté cargado correctamente

## 📊 Monitoreo

### Logs del Servidor
El servidor muestra logs detallados:
- ✅ Conexiones exitosas
- 📝 Nuevos RSVPs registrados
- ❌ Errores y excepciones

### Estadísticas en Tiempo Real
Accede a `/api/stats` para ver:
- Total de invitados registrados
- Total de asistentes confirmados

## 🚀 Despliegue

### Local
```bash
cd server
npm start
```

### Producción
1. Configura variables de entorno
2. Usa PM2 o similar para gestión de procesos
3. Configura un proxy reverso (nginx)
4. Usa HTTPS en producción

## 📝 Licencia

MIT License - Libre para uso personal y comercial.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**¡Disfruta tu evento! 🎉**
