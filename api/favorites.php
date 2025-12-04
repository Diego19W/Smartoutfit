<?php
require_once '../db_connection.php';

// Handle CORS with credentials
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
header("Access-Control-Allow-Origin: $origin");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Pragma, Cache-Control");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Debug logging
$logFile = __DIR__ . '/../uploads/debug.log';
function logDebug($message) {
    global $logFile;
    file_put_contents($logFile, date('[Y-m-d H:i:s] [FAV] ') . $message . "\n", FILE_APPEND);
}

logDebug("Request Method: " . $_SERVER['REQUEST_METHOD']);
logDebug("Session ID before start: " . session_id());

session_start();

logDebug("Session ID after start: " . session_id());
logDebug("User ID in session: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'Not set'));

// Ensure user is logged in for all actions
if (!isset($_SESSION['user_id'])) {
    logDebug("Unauthorized access attempt");
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit();
}

$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getFavorites($pdo, $userId);
        break;
    case 'POST':
        addFavorite($pdo, $userId);
        break;
    case 'DELETE':
        removeFavorite($pdo, $userId);
        break;
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}

function getFavorites($pdo, $userId) {
    try {
        // Fetch favorite product IDs
        $stmt = $pdo->prepare("SELECT id_producto FROM favoritos WHERE id_usuario = ?");
        $stmt->execute([$userId]);
        $favorites = $stmt->fetchAll(PDO::FETCH_COLUMN);

        echo json_encode($favorites);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error fetching favorites: " . $e->getMessage()]);
    }
}

function addFavorite($pdo, $userId) {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->productId)) {
        http_response_code(400);
        echo json_encode(["message" => "Product ID required"]);
        return;
    }

    try {
        $stmt = $pdo->prepare("INSERT IGNORE INTO favoritos (id_usuario, id_producto) VALUES (?, ?)");
        $stmt->execute([$userId, $data->productId]);

        echo json_encode(["message" => "Added to favorites"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error adding favorite: " . $e->getMessage()]);
    }
}

function removeFavorite($pdo, $userId) {
    $data = json_decode(file_get_contents("php://input"));

    // Support both JSON body and query param for DELETE
    $productId = isset($data->productId) ? $data->productId : (isset($_GET['productId']) ? $_GET['productId'] : null);

    if (!$productId) {
        http_response_code(400);
        echo json_encode(["message" => "Product ID required"]);
        return;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM favoritos WHERE id_usuario = ? AND id_producto = ?");
        $stmt->execute([$userId, $productId]);

        echo json_encode(["message" => "Removed from favorites"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error removing favorite: " . $e->getMessage()]);
    }
}
?>
