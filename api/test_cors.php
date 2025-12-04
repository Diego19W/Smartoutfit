<?php
// Handle CORS with credentials
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
header("Access-Control-Allow-Origin: $origin");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

echo json_encode([
    "message" => "CORS Test",
    "session_id" => session_id(),
    "user_id" => isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null,
    "origin_received" => $origin,
    "cookies_received" => $_COOKIE
]);
?>
