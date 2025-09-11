#!/usr/bin/env node

/**
 * Verificación rápida de la base de datos
 * Uso: node quick-db-check.js
 */

require('dotenv').config();
const { testConnection } = require('./config/db');

async function quickCheck() {
    console.log('🔍 Verificación rápida de BD...');

    try {
        const isConnected = await testConnection();

        if (isConnected) {
            console.log('✅ Base de datos conectada correctamente');
            console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
            console.log(`   Database: ${process.env.DB_NAME || 'invitacion'}`);
        } else {
            console.log('❌ No se pudo conectar a la base de datos');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    process.exit(0);
}

quickCheck();
