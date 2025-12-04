<?php
$host = 'localhost';
$dbname = 'smartoutfit'; // Adjust this if your database name is different
$username = 'root';
$password = '';

// Configure session parameters for localhost/CORS
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => '', // Allow current domain
    'secure' => false, // False for localhost/http
    'httponly' => true,
    'samesite' => 'Lax'
]);

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "Connected successfully"; 
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
