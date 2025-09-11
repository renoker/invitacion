#!/usr/bin/env node

/**
 * Script para verificar la conexión a la base de datos
 * Uso: node check-db.js
 */

require('dotenv').config();
const { pool, testConnection } = require('./config/db');

async function checkDatabaseConnection() {
    console.log('🔍 Verificando conexión a la base de datos...\n');

    // Mostrar configuración
    console.log('📋 Configuración de base de datos:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   User: ${process.env.DB_USER || 'tnb'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'invitacion'}`);
    console.log(`   Port: ${process.env.DB_PORT || 3306}\n`);

    try {
        // Test 1: Conexión básica
        console.log('1️⃣ Probando conexión básica...');
        const isConnected = await testConnection();

        if (!isConnected) {
            console.log('❌ Falló la conexión básica');
            return;
        }
        console.log('✅ Conexión básica exitosa\n');

        // Test 2: Ping a la base de datos
        console.log('2️⃣ Probando ping a la base de datos...');
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        console.log('✅ Ping exitoso\n');

        // Test 3: Verificar tabla invitados
        console.log('3️⃣ Verificando tabla invitados...');
        const [tableCheck] = await pool.execute('SHOW TABLES LIKE "invitados"');

        if (tableCheck.length === 0) {
            console.log('⚠️  La tabla "invitados" no existe');
        } else {
            console.log('✅ Tabla "invitados" existe');

            // Test 4: Contar registros
            console.log('4️⃣ Contando registros en la tabla...');
            const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM invitados');
            console.log(`✅ Total de registros: ${countResult[0].total}`);

            // Test 5: Mostrar estructura de la tabla
            console.log('5️⃣ Estructura de la tabla:');
            const [structure] = await pool.execute('DESCRIBE invitados');
            console.table(structure);
        }

        // Test 6: Estadísticas
        console.log('6️⃣ Estadísticas de RSVPs:');
        try {
            const [totalRows] = await pool.execute('SELECT COUNT(*) as total FROM invitados');
            const [asistentesRows] = await pool.execute('SELECT SUM(num_asistentes) as total_asistentes FROM invitados');

            console.log(`   📊 Total invitados: ${totalRows[0].total}`);
            console.log(`   👥 Total asistentes: ${asistentesRows[0].total_asistentes || 0}`);
        } catch (error) {
            console.log('⚠️  No se pudieron obtener estadísticas:', error.message);
        }

        console.log('\n🎉 ¡Todas las pruebas de conexión pasaron exitosamente!');

    } catch (error) {
        console.error('\n❌ Error durante la verificación:');
        console.error(`   Mensaje: ${error.message}`);
        console.error(`   Código: ${error.code || 'N/A'}`);
        console.error(`   Errno: ${error.errno || 'N/A'}`);
        console.error(`   SQL State: ${error.sqlState || 'N/A'}`);

        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Posibles soluciones:');
            console.error('   1. Verifica que MySQL esté ejecutándose');
            console.error('   2. Confirma que el puerto 3306 esté abierto');
            console.error('   3. Revisa la configuración de firewall');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 Posibles soluciones:');
            console.error('   1. Verifica el usuario y contraseña en .env');
            console.error('   2. Confirma que el usuario tenga permisos');
            console.error('   3. Revisa la configuración de MySQL');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\n💡 Posibles soluciones:');
            console.error('   1. Verifica que la base de datos exista');
            console.error('   2. Ejecuta el servidor para crear la base de datos automáticamente');
        }
    } finally {
        // Cerrar conexiones
        try {
            await pool.end();
            console.log('\n🔌 Conexiones cerradas correctamente');
        } catch (closeError) {
            console.error('⚠️  Error cerrando conexiones:', closeError.message);
        }
    }
}

// Ejecutar verificación
checkDatabaseConnection()
    .then(() => {
        console.log('\n✨ Verificación completada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    });
