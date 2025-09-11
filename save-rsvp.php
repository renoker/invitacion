<?php

/**
 * Archivo PHP para manejar el formulario RSVP
 * Conecta directamente a MySQL sin necesidad de Node.js
 */

// Configurar headers para CORS y JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

// Obtener datos del request
$input = json_decode(file_get_contents('php://input'), true);

// Si no hay JSON, intentar con POST normal
if (!$input) {
    $input = $_POST;
}

// Validar que todos los campos estén presentes
$required_fields = ['nombre', 'apellido', 'email', 'telefono', 'numAsistentes'];
foreach ($required_fields as $field) {
    if (!isset($input[$field]) || empty(trim($input[$field]))) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => "El campo '$field' es requerido"
        ]);
        exit;
    }
}

// Limpiar y validar datos
$nombre = trim($input['nombre']);
$apellido = trim($input['apellido']);
$email = trim($input['email']);
$telefono = trim($input['telefono']);
$numAsistentes = intval($input['numAsistentes']);

// Validaciones adicionales
if (strlen($nombre) < 2) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'El nombre debe tener al menos 2 caracteres'
    ]);
    exit;
}

if (strlen($apellido) < 2) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'El apellido debe tener al menos 2 caracteres'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Formato de email inválido'
    ]);
    exit;
}

if (strlen($telefono) < 10) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'El teléfono debe tener al menos 10 dígitos'
    ]);
    exit;
}

if ($numAsistentes < 1 || $numAsistentes > 10) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'El número de asistentes debe estar entre 1 y 10'
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

    // Verificar si el email ya existe
    $stmt = $pdo->prepare("SELECT id FROM invitados WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Este email ya ha sido registrado anteriormente'
        ]);
        exit;
    }

    // Insertar nuevo RSVP
    $stmt = $pdo->prepare("
        INSERT INTO invitados (nombre, apellido, email, telefono, num_asistentes, fecha_registro) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ");

    $stmt->execute([$nombre, $apellido, $email, $telefono, $numAsistentes]);

    $insertId = $pdo->lastInsertId();

    // Log del registro exitoso
    error_log("RSVP registrado exitosamente: $nombre $apellido ($email) - $numAsistentes asistentes");

    // Respuesta exitosa
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'RSVP registrado exitosamente',
        'data' => [
            'id' => $insertId,
            'nombre' => $nombre,
            'apellido' => $apellido,
            'email' => $email,
            'telefono' => $telefono,
            'numAsistentes' => $numAsistentes,
            'fechaRegistro' => date('Y-m-d H:i:s')
        ]
    ]);
} catch (PDOException $e) {
    // Log del error
    error_log("Error en save-rsvp.php: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión a la base de datos. Por favor, intenta más tarde.'
    ]);
} catch (Exception $e) {
    // Log del error
    error_log("Error general en save-rsvp.php: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor'
    ]);
}
