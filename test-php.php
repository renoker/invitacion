<?php

/**
 * Archivo de prueba para verificar que PHP funciona correctamente
 */

// Configurar headers
header('Content-Type: application/json');

// Configuración de la base de datos
$host = 'localhost';
$dbname = 'invitacion';
$username = 'ulises';
$password = 'Eltiempodet1#';

$response = [
    'php_version' => phpversion(),
    'pdo_mysql' => extension_loaded('pdo_mysql'),
    'database_connection' => false,
    'database_tables' => [],
    'timestamp' => date('Y-m-d H:i:s')
];

try {
    // Probar conexión a la base de datos
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $response['database_connection'] = true;

    // Verificar tablas
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $response['database_tables'] = $tables;

    // Contar registros en invitados
    if (in_array('invitados', $tables)) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM invitados");
        $count = $stmt->fetch()['count'];
        $response['invitados_count'] = $count;
    }
} catch (PDOException $e) {
    $response['database_error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
