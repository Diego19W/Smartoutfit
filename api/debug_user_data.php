<?php
include_once '../db_connection.php';

$userId = 1; // Diego's ID from screenshot

try {
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = :id");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    echo "Raw Database Output for User ID $userId:\n";
    print_r($user);

    echo "\nJSON Encoded (Simulating API response):\n";
    echo json_encode([
        "authenticated" => true,
        "user" => [
            "id" => $user['id'],
            "nombre" => $user['nombre'],
            "email" => $user['email'],
            "role" => $user['tipo_usuario'],
            "telefono" => $user['telefono'] ?? 'MISSING',
            "direccion" => $user['direccion'] ?? 'MISSING',
            "ciudad" => $user['ciudad'] ?? 'MISSING',
            "estado" => $user['estado'] ?? 'MISSING',
            "codigo_postal" => $user['codigo_postal'] ?? 'MISSING'
        ]
    ], JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
