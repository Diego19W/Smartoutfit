<?php
// api/test_profile_orders.php
include_once 'db_connection.php';

// Simulate a logged-in user session
session_start();
$_SESSION['user_id'] = 1; // Assuming user ID 1 exists
$_SESSION['user_name'] = 'Test User';
$_SESSION['user_role'] = 'cliente';

echo "Testing Profile Update...\n";
// Test Profile Update
$updateData = [
    'nombre' => 'Test User Updated',
    'telefono' => '555-0123',
    'direccion' => '123 Test St',
    'ciudad' => 'Test City',
    'estado' => 'Test State',
    'codigo_postal' => '12345'
];

$ch = curl_init('http://localhost/E-commerce%20Fashion%20Store%20Mockup%202/api/auth.php?action=update_profile');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
curl_setopt($ch, CURLOPT_COOKIE, 'PHPSESSID=' . session_id()); // Pass session
$response = curl_exec($ch);
curl_close($ch);

echo "Update Response: " . $response . "\n\n";

echo "Testing Get Orders...\n";
// Test Get Orders
$ch = curl_init('http://localhost/E-commerce%20Fashion%20Store%20Mockup%202/api/orders.php?action=list&user_id=1');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo "Orders Response: " . substr($response, 0, 500) . "...\n"; // Truncate for readability
?>
