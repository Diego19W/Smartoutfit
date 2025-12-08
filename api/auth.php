<?php
require_once __DIR__ . '/../db_connection.php';

// Configuración de CORS y Headers
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
header("Access-Control-Allow-Origin: $origin");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Pragma, Cache-Control");
header("Access-Control-Allow-Credentials: true");

// Manejo de preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Iniciar sesión PHP
session_start();

// Debug logging
function logDebug($message) {
    $logFile = __DIR__ . '/../uploads/debug.log';
    file_put_contents($logFile, date('[Y-m-d H:i:s] [AUTH] ') . $message . "\n", FILE_APPEND);
}

logDebug("Session started. ID: " . session_id());
if (isset($_SESSION['user_id'])) {
    logDebug("User ID in session: " . $_SESSION['user_id']);
} else {
    logDebug("No user ID in session");
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'register':
        handleRegister($pdo);
        break;
    case 'login':
        handleLogin($pdo);
        break;
    case 'social_login':
        handleSocialLogin($pdo);
        break;
    case 'check':
        handleCheckSession();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'update_profile':
        handleUpdateProfile($pdo);
        break;
    default:
        http_response_code(400);
        echo json_encode(["message" => "Invalid action"]);
        break;
}

function handleRegister($pdo) {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->nombre) || empty($data->email) || empty($data->password)) {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data"]);
        return;
    }

    try {
        // Verificar si el email ya existe
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = :email");
        $stmt->execute([':email' => $data->email]);
        
        if ($stmt->rowCount() > 0) {
            http_response_code(409); // Conflict
            echo json_encode(["message" => "Email already exists"]);
            return;
        }

        // Hash de contraseña
        $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

        // Insertar usuario
        $sql = "INSERT INTO usuarios (nombre, email, contraseña_hash, tipo_usuario, fecha_registro) VALUES (:nombre, :email, :password_hash, 'cliente', NOW())";
        $stmt = $pdo->prepare($sql);
        
        if ($stmt->execute([
            ':nombre' => $data->nombre,
            ':email' => $data->email,
            ':password_hash' => $password_hash
        ])) {
            $userId = $pdo->lastInsertId();
            
            // Iniciar sesión automáticamente
            $_SESSION['user_id'] = $userId;
            $_SESSION['user_name'] = $data->nombre;
            $_SESSION['user_role'] = 'cliente';

            http_response_code(201);
            echo json_encode([
                "message" => "User registered successfully",
                "user" => [
                    "id" => $userId,
                    "nombre" => $data->nombre,
                    "email" => $data->email,
                    "role" => "cliente"
                ]
            ]);
        } else {
            throw new Exception("Error inserting user");
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error: " . $e->getMessage()]);
    }
}

function handleLogin($pdo) {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->email) || empty($data->password)) {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data"]);
        return;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = :email");
        $stmt->execute([':email' => $data->email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($data->password, $user['contraseña_hash'])) {
            // Login exitoso
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['nombre'];
            $_SESSION['user_role'] = $user['tipo_usuario'];

            echo json_encode([
                "message" => "Login successful",
                "user" => [
                    "id" => $user['id'],
                    "nombre" => $user['nombre'],
                    "email" => $user['email'],
                    "role" => $user['tipo_usuario'],
                    "telefono" => $user['telefono'] ?? '',
                    "direccion" => $user['direccion'] ?? '',
                    "ciudad" => $user['ciudad'] ?? '',
                    "estado" => $user['estado'] ?? '',
                    "codigo_postal" => $user['codigo_postal'] ?? '',
                    "puntos" => (int)($user['puntos'] ?? 0)
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid credentials"]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error: " . $e->getMessage()]);
    }
}

function handleCheckSession() {
    if (isset($_SESSION['user_id'])) {
        global $pdo;
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = :id");
        $stmt->execute([':id' => $_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "authenticated" => true,
            "user" => [
                "id" => $user['id'],
                "nombre" => $user['nombre'],
                "email" => $user['email'],
                "role" => $user['tipo_usuario'],
                "telefono" => $user['telefono'] ?? '',
                "direccion" => $user['direccion'] ?? '',
                "ciudad" => $user['ciudad'] ?? '',
                "estado" => $user['estado'] ?? '',
                "codigo_postal" => $user['codigo_postal'] ?? '',
                "puntos" => (int)($user['puntos'] ?? 0)
            ]
        ]);
    } else {
        echo json_encode(["authenticated" => false]);
    }
}

function handleLogout() {
    session_destroy();
    echo json_encode(["message" => "Logged out successfully"]);
}

function handleUpdateProfile($pdo) {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized"]);
        return;
    }

    $data = json_decode(file_get_contents("php://input"));
    $userId = $_SESSION['user_id'];

    try {
        $sql = "UPDATE usuarios SET 
                nombre = :nombre,
                telefono = :telefono,
                direccion = :direccion,
                ciudad = :ciudad,
                estado = :estado,
                codigo_postal = :codigo_postal
                WHERE id = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nombre' => $data->nombre,
            ':telefono' => $data->telefono,
            ':direccion' => $data->direccion,
            ':ciudad' => $data->ciudad,
            ':estado' => $data->estado,
            ':codigo_postal' => $data->codigo_postal,
            ':id' => $userId
        ]);

        // Update session name if changed
        $_SESSION['user_name'] = $data->nombre;

        echo json_encode([
            "message" => "Profile updated successfully",
            "user" => [
                "id" => $userId,
                "nombre" => $data->nombre,
                "email" => $_SESSION['user_email'] ?? '', // Assuming email doesn't change here
                "role" => $_SESSION['user_role'],
                "telefono" => $data->telefono,
                "direccion" => $data->direccion,
                "ciudad" => $data->ciudad,
                "estado" => $data->estado,
                "codigo_postal" => $data->codigo_postal
            ]
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error updating profile: " . $e->getMessage()]);
    }
}

function handleSocialLogin($pdo) {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->firebase_uid) || empty($data->email)) {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data"]);
        return;
    }

    try {
        // Check if user already exists by Firebase UID
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE firebase_uid = :firebase_uid");
        $stmt->execute([':firebase_uid' => $data->firebase_uid]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // User exists, update login info if needed
            $userId = $user['id'];
        } else {
            // Check if email already exists (user may have registered with email/password first)
            $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = :email");
            $stmt->execute([':email' => $data->email]);
            $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($existingUser) {
                // Link Firebase UID to existing user
                $stmt = $pdo->prepare("UPDATE usuarios SET firebase_uid = :firebase_uid WHERE id = :id");
                $stmt->execute([
                    ':firebase_uid' => $data->firebase_uid,
                    ':id' => $existingUser['id']
                ]);
                $userId = $existingUser['id'];
                $user = $existingUser;
            } else {
                // Create new user
                $sql = "INSERT INTO usuarios (nombre, email, firebase_uid, tipo_usuario, fecha_registro) 
                        VALUES (:nombre, :email, :firebase_uid, 'cliente', NOW())";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    ':nombre' => $data->nombre,
                    ':email' => $data->email,
                    ':firebase_uid' => $data->firebase_uid
                ]);
                $userId = $pdo->lastInsertId();

                // Fetch the newly created user
                $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = :id");
                $stmt->execute([':id' => $userId]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
            }
        }

        // Set session
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_name'] = $user['nombre'];
        $_SESSION['user_role'] = $user['tipo_usuario'];

        echo json_encode([
            "message" => "Social login successful",
            "user" => [
                "id" => $user['id'],
                "nombre" => $user['nombre'],
                "email" => $user['email'],
                "role" => $user['tipo_usuario'],
                "telefono" => $user['telefono'] ?? '',
                "direccion" => $user['direccion'] ?? '',
                "ciudad" => $user['ciudad'] ?? '',
                "estado" => $user['estado'] ?? '',
                "codigo_postal" => $user['codigo_postal'] ?? '',
                "puntos" => (int)($user['puntos'] ?? 0)
            ]
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error: " . $e->getMessage()]);
    }
}
?>
