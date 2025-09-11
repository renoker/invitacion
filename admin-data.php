<?php

/**
 * Archivo PHP para obtener datos de administración
 * Reemplaza las llamadas a /api/rsvp y /api/stats
 */

// Configurar headers para CORS y JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

// Configuración de la base de datos
$host = 'localhost';
$dbname = 'invitacion';
$username = 'ulises';
$password = 'Eltiempodet1#';

try {
    // Conectar a MySQL
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Verificar si se solicita estadísticas
    if (isset($_GET['action']) && $_GET['action'] === 'stats') {
        // Obtener estadísticas
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM invitados");
        $totalInvitados = $stmt->fetch()['total'];

        $stmt = $pdo->query("SELECT COUNT(*) as total FROM invitados WHERE num_asistentes > 0");
        $totalAsistentes = $stmt->fetch()['total'];

        $stmt = $pdo->query("SELECT COUNT(*) as total FROM invitados WHERE num_asistentes = 0");
        $totalNoAsistentes = $stmt->fetch()['total'];

        $stmt = $pdo->query("SELECT SUM(num_asistentes) as total_asistentes FROM invitados WHERE num_asistentes > 0");
        $totalPersonasAsistentes = $stmt->fetch()['total_asistentes'] ?? 0;

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => [
                'totalInvitados' => intval($totalInvitados),
                'totalAsistentes' => intval($totalAsistentes),
                'totalNoAsistentes' => intval($totalNoAsistentes),
                'totalPersonasAsistentes' => intval($totalPersonasAsistentes)
            ]
        ]);
        exit;
    }

    // Verificar si se solicitan solo asistentes
    if (isset($_GET['action']) && $_GET['action'] === 'asistentes') {
        $stmt = $pdo->query("
            SELECT 
                id,
                nombre,
                apellido,
                email,
                telefono,
                num_asistentes,
                fecha_registro
            FROM invitados 
            WHERE num_asistentes > 0
            ORDER BY fecha_registro DESC
        ");

        $invitados = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'count' => count($invitados),
            'data' => $invitados
        ]);
        exit;
    }

    // Verificar si se solicitan solo no asistentes
    if (isset($_GET['action']) && $_GET['action'] === 'no-asistentes') {
        $stmt = $pdo->query("
            SELECT 
                id,
                nombre,
                apellido,
                email,
                telefono,
                num_asistentes,
                fecha_registro
            FROM invitados 
            WHERE num_asistentes = 0
            ORDER BY fecha_registro DESC
        ");

        $invitados = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'count' => count($invitados),
            'data' => $invitados
        ]);
        exit;
    }

    // Obtener todos los invitados
    $stmt = $pdo->query("
        SELECT 
            id,
            nombre,
            apellido,
            email,
            telefono,
            num_asistentes,
            fecha_registro
        FROM invitados 
        ORDER BY fecha_registro DESC
    ");

    $invitados = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'count' => count($invitados),
        'data' => $invitados
    ]);
} catch (PDOException $e) {
    // Log del error
    error_log("Error en admin-data.php: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión a la base de datos'
    ]);
} catch (Exception $e) {
    // Log del error
    error_log("Error general en admin-data.php: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor'
    ]);
}
