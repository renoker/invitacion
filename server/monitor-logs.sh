#!/bin/bash

# Script para monitorear logs de la aplicación en producción
# Uso: ./monitor-logs.sh

echo "🔍 Monitoreo de logs de la aplicación de invitaciones"
echo "=================================================="
echo ""

# Verificar si PM2 está instalado
if command -v pm2 &> /dev/null; then
    echo "📊 Estado de PM2:"
    pm2 status
    echo ""
    
    echo "📋 Logs en tiempo real (Ctrl+C para salir):"
    echo "=========================================="
    pm2 logs invitacion-app --lines 50
else
    echo "⚠️  PM2 no está instalado. Mostrando logs del sistema:"
    echo "=================================================="
    
    # Buscar logs de Node.js en diferentes ubicaciones
    if [ -f "/var/log/syslog" ]; then
        echo "📋 Logs del sistema (últimas 50 líneas):"
        tail -f /var/log/syslog | grep -i "node\|invitacion\|mysql"
    else
        echo "❌ No se encontraron logs del sistema"
        echo "💡 Ejecuta la aplicación manualmente para ver los logs:"
        echo "   cd /ruta/a/tu/proyecto/server"
        echo "   npm start"
    fi
fi

echo ""
echo "🔧 Comandos útiles para debugging:"
echo "================================="
echo "• Ver estado de MySQL: sudo systemctl status mysql"
echo "• Conectar a MySQL: mysql -u ulises -p"
echo "• Verificar variables de entorno: cat .env"
echo "• Probar conexión a DB: curl http://localhost:3000/health/db"
echo "• Ver logs específicos: pm2 logs invitacion-app --err"
