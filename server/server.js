const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { pool, testConnection, initializeDatabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static('../'));

// Routes without .html extension
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/no-asistencia', (req, res) => {
    res.sendFile(path.join(__dirname, '../no-asistensia.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// RSVP endpoint
app.post('/api/rsvp', async (req, res) => {
    try {
        const { nombre, apellido, email, telefono, numAsistentes } = req.body;

        // Validate required fields
        if (!nombre || !apellido || !email || !telefono || !numAsistentes) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de email inválido'
            });
        }

        // Validate number of attendees
        if (numAsistentes < 1 || numAsistentes > 10) {
            return res.status(400).json({
                success: false,
                message: 'El número de asistentes debe estar entre 1 y 10'
            });
        }

        // Check if email already exists
        const [existingRows] = await pool.execute(
            'SELECT id FROM invitados WHERE email = ?',
            [email]
        );

        if (existingRows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Este email ya ha sido registrado anteriormente'
            });
        }

        // Insert new RSVP
        const [result] = await pool.execute(
            'INSERT INTO invitados (nombre, apellido, email, telefono, num_asistentes) VALUES (?, ?, ?, ?, ?)',
            [nombre, apellido, email, telefono, numAsistentes]
        );

        console.log(`✅ Nuevo RSVP registrado: ${nombre} ${apellido} (${email}) - ${numAsistentes} asistentes`);

        res.status(200).json({
            success: true,
            message: 'RSVP registrado exitosamente',
            data: {
                id: result.insertId,
                nombre,
                apellido,
                email,
                telefono,
                numAsistentes,
                fechaRegistro: new Date()
            }
        });

    } catch (error) {
        console.error('❌ Error en endpoint /api/rsvp:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
});

// Get all RSVPs (for admin purposes)
app.get('/api/rsvp', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM invitados ORDER BY fecha_registro DESC'
        );

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error('❌ Error obteniendo RSVPs:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Get RSVP statistics
app.get('/api/stats', async (req, res) => {
    try {
        const [totalRows] = await pool.execute('SELECT COUNT(*) as total FROM invitados');
        const [asistentesRows] = await pool.execute('SELECT SUM(num_asistentes) as total_asistentes FROM invitados');

        const stats = {
            totalInvitados: totalRows[0].total,
            totalAsistentes: asistentesRows[0].total_asistentes || 0
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado'
    });
});

// Start server
async function startServer() {
    try {
        // Test database connection
        console.log('🔍 Configuración de base de datos:');
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   User: ${process.env.DB_USER || 'tnb'}`);
        console.log(`   Database: ${process.env.DB_NAME || 'invitacion'}`);
        console.log(`   Port: ${process.env.DB_PORT || 3306}`);

        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos. Verifica tu configuración de MySQL.');
            console.error('💡 Asegúrate de que:');
            console.error('   1. MySQL esté instalado y corriendo');
            console.error('   2. Las credenciales sean correctas');
            console.error('   3. El usuario tenga permisos para crear bases de datos');
            console.error('   4. El puerto 3306 esté abierto');
            process.exit(1);
        }

        // Initialize database
        await initializeDatabase();

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
            console.log(`📊 Endpoints disponibles:`);
            console.log(`   - POST /api/rsvp - Registrar RSVP`);
            console.log(`   - GET  /api/rsvp - Obtener todos los RSVPs`);
            console.log(`   - GET  /api/stats - Estadísticas`);
            console.log(`   - GET  /health - Estado del servidor`);
        });

    } catch (error) {
        console.error('❌ Error iniciando el servidor:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor...');
    try {
        await pool.end();
        console.log('✅ Conexiones de base de datos cerradas');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error cerrando conexiones:', error);
        process.exit(1);
    }
});

startServer();
