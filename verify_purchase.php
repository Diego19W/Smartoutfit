<?php
require_once 'db_connection.php';

function testPurchase($pdo) {
    echo "Starting Purchase Verification...\n";
    echo "--------------------------------\n";

    // 1. Select a test product
    $stmt = $pdo->query("SELECT id_producto, nombre FROM productos LIMIT 1");
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$product) {
        die("Error: No products found in database.\n");
    }

    $productId = $product['id_producto'];
    $productName = $product['nombre'];
    $size = 'M'; // Assuming M exists, if not we'll find one
    
    // Check stock for this product/size
    $stmt = $pdo->prepare("SELECT stock FROM stock WHERE id_producto = ? AND talla = ?");
    $stmt->execute([$productId, $size]);
    $stockRow = $stmt->fetch(PDO::FETCH_ASSOC);

    // If no stock for M, find a size with stock
    if (!$stockRow || $stockRow['stock'] <= 0) {
        $stmt = $pdo->prepare("SELECT talla, stock FROM stock WHERE id_producto = ? AND stock > 0 LIMIT 1");
        $stmt->execute([$productId]);
        $stockRow = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$stockRow) {
             die("Error: Product '$productName' has no stock in any size.\n");
        }
        $size = $stockRow['talla'];
    }

    $initialStock = $stockRow['stock'];
    echo "Test Product: $productName (ID: $productId)\n";
    echo "Target Size: $size\n";
    echo "Initial Stock: $initialStock\n";

    // 2. Prepare Order Payload
    $payload = [
        'customer' => [
            'firstName' => 'Test',
            'lastName' => 'User',
            'email' => 'test@example.com', // This should trigger the email logic
            'phone' => '5555555555',
            'address' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'zip' => '12345'
        ],
        'items' => [
            [
                'productId' => $productId,
                'quantity' => 1,
                'size' => $size,
                'price' => 100 // Arbitrary price
            ]
        ],
        'total' => 100,
        'pointsRedeemed' => 0
    ];

    // 3. Send Request to API
    $url = "http://localhost/E-commerce%20Fashion%20Store%20Mockup%202/api/orders.php";
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    echo "Sending purchase request to $url...\n";
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        die("Curl Error: " . curl_error($ch) . "\n");
    }
    curl_close($ch);

    echo "Response Code: $httpCode\n";
    echo "Response Body: $response\n";

    if ($httpCode !== 200) {
        die("Error: API request failed.\n");
    }

    $responseData = json_decode($response, true);
    if (!isset($responseData['orderNumber'])) {
        die("Error: Response does not contain orderNumber.\n");
    }
    
    $orderNumber = $responseData['orderNumber'];
    echo "Order Created: $orderNumber\n";

    // 4. Verify Stock Deduction
    $stmt = $pdo->prepare("SELECT stock FROM stock WHERE id_producto = ? AND talla = ?");
    $stmt->execute([$productId, $size]);
    $newStock = $stmt->fetchColumn();

    echo "New Stock: $newStock\n";

    if ($newStock == $initialStock - 1) {
        echo "SUCCESS: Stock deducted correctly ( $initialStock -> $newStock )\n";
    } else {
        echo "FAILURE: Stock mismatch! Expected " . ($initialStock - 1) . ", got $newStock\n";
    }

    // 5. Verify Order in DB
    $stmt = $pdo->prepare("SELECT * FROM compras WHERE numero_orden = ?");
    $stmt->execute([$orderNumber]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($order) {
        echo "SUCCESS: Order found in database.\n";
        echo "Order Status: " . $order['estado'] . "\n";
    } else {
        echo "FAILURE: Order not found in database.\n";
    }
    
    echo "--------------------------------\n";
    echo "Verification Complete.\n";
}

try {
    testPurchase($pdo);
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
?>
