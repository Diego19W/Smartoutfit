<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
header("Access-Control-Allow-Origin: $origin");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Pragma, Cache-Control");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../db_connection.php';

// Session is already started in db_connection.php

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getOrders($pdo);
        break;
    case 'PUT':
        updateOrderStatus($pdo);
        break;
    case 'POST':
        createOrder($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}

function createOrder($pdo) {
    // Start session if not already started
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->items) || !is_array($data->items) || count($data->items) === 0) {
        http_response_code(400);
        echo json_encode(["message" => "No items in order"]);
        return;
    }

    try {
        error_log("Processing order data: " . print_r($data, true));
        $pdo->beginTransaction();

        // 1. Determine User ID
        $id_usuario = null;
        if (isset($_SESSION['user_id'])) {
            $id_usuario = $_SESSION['user_id'];
        } else {
            // Guest Checkout Logic
            $email = $data->customer->email ?? null;
            if (!$email) {
                throw new Exception("Email is required for guest checkout");
            }

            // Check if user exists
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = :email");
            $stmt->execute([':email' => $email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $id_usuario = $user['id'];
            } else {
                // Create new guest user
                $sql = "INSERT INTO usuarios (nombre, email, contraseña_hash, telefono, direccion, ciudad, estado, codigo_postal, tipo_usuario, fecha_registro) 
                        VALUES (:nombre, :email, :hash, :telefono, :direccion, :ciudad, :estado, :zip, 'cliente', NOW())";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    ':nombre' => ($data->customer->firstName ?? '') . ' ' . ($data->customer->lastName ?? ''),
                    ':email' => $email,
                    ':hash' => password_hash(bin2hex(random_bytes(8)), PASSWORD_BCRYPT), // Random password
                    ':telefono' => $data->customer->phone ?? null,
                    ':direccion' => $data->customer->address ?? null,
                    ':ciudad' => $data->customer->city ?? null,
                    ':estado' => $data->customer->state ?? null,
                    ':zip' => $data->customer->zip ?? null
                ]);
                $id_usuario = $pdo->lastInsertId();
            }
        }

        // 2. Update User Address (if provided and user exists)
        if ($id_usuario && isset($data->customer)) {
            $updateSql = "UPDATE usuarios SET 
                          telefono = COALESCE(:telefono, telefono),
                          direccion = COALESCE(:direccion, direccion),
                          ciudad = COALESCE(:ciudad, ciudad),
                          estado = COALESCE(:estado, estado),
                          codigo_postal = COALESCE(:zip, codigo_postal)
                          WHERE id = :id";
            $stmt = $pdo->prepare($updateSql);
            $stmt->execute([
                ':telefono' => $data->customer->phone ?? null,
                ':direccion' => $data->customer->address ?? null,
                ':ciudad' => $data->customer->city ?? null,
                ':estado' => $data->customer->state ?? null,
                ':zip' => $data->customer->zip ?? null,
                ':id' => $id_usuario
            ]);
            error_log("Updated user info for ID: $id_usuario");
        }

        // 3. Validate Stock
        foreach ($data->items as $item) {
            // Get current product stock
            $checkStockSql = "SELECT stock_talla FROM productos WHERE id_producto = :id_producto";
            $checkStmt = $pdo->prepare($checkStockSql);
            $checkStmt->bindValue(':id_producto', $item->productId);
            $checkStmt->execute();
            $product = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$product) {
                throw new Exception("Producto no encontrado: {$item->productId}");
            }
            
            $sizeStock = json_decode($product['stock_talla'], true);
            $availableStock = $sizeStock[$item->size] ?? 0;
            
            if ($availableStock < $item->quantity) {
                throw new Exception("Stock insuficiente para {$item->size}. Disponible: {$availableStock}, Solicitado: {$item->quantity}");
            }
        }

        $numero_orden = 'ORD-' . time() . '-' . rand(100, 999);
        $id_transaccion = 'TR-' . time() . '-' . rand(1000, 9999);
        $fecha_compra = date('Y-m-d H:i:s');

        // 4. Insert Order Items
        $sql = "INSERT INTO compras (id_usuario, id_producto, cantidad, total, fecha_compra, numero_orden, id_transaccion, estado, talla) VALUES (:id_usuario, :id_producto, :cantidad, :total, :fecha_compra, :numero_orden, :id_transaccion, :estado, :talla)";
        $stmt = $pdo->prepare($sql);

        // Update stock for each item
        $updateStockSql = "UPDATE productos SET stock_talla = :stock_talla, stock = :total_stock WHERE id_producto = :id_producto";
        $updateStmt = $pdo->prepare($updateStockSql);

        foreach ($data->items as $item) {
            // Insert order
            $stmt->bindValue(':id_usuario', $id_usuario);
            $stmt->bindValue(':id_producto', $item->productId);
            $stmt->bindValue(':cantidad', $item->quantity);
            $stmt->bindValue(':total', $item->price * $item->quantity);
            $stmt->bindValue(':fecha_compra', $fecha_compra);
            $stmt->bindValue(':numero_orden', $numero_orden);
            $stmt->bindValue(':id_transaccion', $id_transaccion);
            $stmt->bindValue(':estado', 'pendiente');
            $stmt->bindValue(':talla', $item->size);
            $stmt->execute();
            
            // Update stock
            $getStockSql = "SELECT stock_talla FROM productos WHERE id_producto = :id_producto";
            $getStockStmt = $pdo->prepare($getStockSql);
            $getStockStmt->bindValue(':id_producto', $item->productId);
            $getStockStmt->execute();
            $productData = $getStockStmt->fetch(PDO::FETCH_ASSOC);
            
            $sizeStock = json_decode($productData['stock_talla'], true);
            $sizeStock[$item->size] = max(0, ($sizeStock[$item->size] ?? 0) - $item->quantity);
            
            // Calculate total stock
            $totalStock = array_sum($sizeStock);
            
            $updateStmt->bindValue(':stock_talla', json_encode($sizeStock));
            $updateStmt->bindValue(':total_stock', $totalStock);
            $updateStmt->bindValue(':id_producto', $item->productId);
            $updateStmt->execute();

            // Update separate 'stock' table
            $updateStockTableSql = "UPDATE stock SET stock = GREATEST(0, stock - :cantidad) WHERE id_producto = :id_producto AND talla = :talla";
            $updateStockTableStmt = $pdo->prepare($updateStockTableSql);
            $updateStockTableStmt->bindValue(':cantidad', $item->quantity);
            $updateStockTableStmt->bindValue(':id_producto', $item->productId);
            $updateStockTableStmt->bindValue(':talla', $item->size);
            $updateStockTableStmt->execute();
        }

        // 5. Handle Points Redemption and Rewards
        $pointsRedeemed = $data->pointsRedeemed ?? 0;
        $finalTotal = $data->total ?? 0;
        
        if ($pointsRedeemed > 0 && $id_usuario) {
            // Verify user has enough points
            $checkPointsSql = "SELECT puntos FROM usuarios WHERE id = :id_usuario";
            $checkPointsStmt = $pdo->prepare($checkPointsSql);
            $checkPointsStmt->execute([':id_usuario' => $id_usuario]);
            $userData = $checkPointsStmt->fetch(PDO::FETCH_ASSOC);
            
            $currentPoints = $userData['puntos'] ?? 0;
            
            if ($currentPoints < $pointsRedeemed) {
                throw new Exception("Puntos insuficientes. Disponible: {$currentPoints}, Solicitado: {$pointsRedeemed}");
            }
            
            // Subtract redeemed points
            $subtractPointsSql = "UPDATE usuarios SET puntos = puntos - :puntos WHERE id = :id_usuario";
            $subtractPointsStmt = $pdo->prepare($subtractPointsSql);
            $subtractPointsStmt->execute([
                ':puntos' => $pointsRedeemed,
                ':id_usuario' => $id_usuario
            ]);
        }
        
        // Award points based on FINAL total (after discount) - 5%
        $pointsEarned = floor($finalTotal * 0.05);
        if ($pointsEarned > 0 && $id_usuario) {
            $updatePointsSql = "UPDATE usuarios SET puntos = puntos + :puntos WHERE id = :id_usuario";
            $updatePointsStmt = $pdo->prepare($updatePointsSql);
            $updatePointsStmt->execute([
                ':puntos' => $pointsEarned,
                ':id_usuario' => $id_usuario
            ]);
        }

        $pdo->commit();
        
        echo json_encode([
            "message" => "Order created successfully and stock updated",
            "orderNumber" => $numero_orden,
            "transactionId" => $id_transaccion
        ]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        error_log("Database Error: " . $e->getMessage());
        echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Order Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["message" => "Error creating order: " . $e->getMessage()]);
    }
}


function getOrders($pdo) {
    try {
        // Fetch orders from 'compras' table joined with 'productos'
        // Use user_id from GET parameter, or fall back to session
        $userId = isset($_GET['user_id']) ? $_GET['user_id'] : (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null);
        
        $sql = "SELECT 
                    c.id_compra as id,
                    c.numero_orden as orderNumber,
                    p.nombre as productName,
                    p.imagen_url as productImage,
                    c.cantidad as quantity,
                    c.fecha_compra as date,
                    c.total,
                    c.estado as status,
                    'Tarjeta' as paymentMethod,
                    c.talla as size
                FROM compras c
                JOIN productos p ON c.id_producto = p.id_producto";
        
        if ($userId) {
            $sql .= " WHERE c.id_usuario = :user_id";
        }
        
        $sql .= " ORDER BY c.fecha_compra DESC";
                
        $stmt = $pdo->prepare($sql);
        
        if ($userId) {
            $stmt->bindValue(':user_id', $userId);
        }
        
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Transform data to match frontend interface
        $formattedOrders = [];
        foreach ($orders as $order) {
            $formattedOrders[] = [
                'id' => (string)$order['id'],
                'orderNumber' => $order['orderNumber'] ?? 'ORD-' . $order['id'],
                'productName' => $order['productName'],
                'productImage' => $order['productImage'],
                'size' => $order['size'],
                'quantity' => (int)$order['quantity'],
                'date' => $order['date'],
                'total' => (float)$order['total'],
                'status' => $order['status'] ?? 'pendiente',
                'paymentMethod' => $order['paymentMethod'],
                'items' => [
                    [
                        'id' => $order['id'] . '-item',
                        'productName' => $order['productName'],
                        'productImage' => $order['productImage'],
                        'size' => $order['size'],
                        'quantity' => (int)$order['quantity'],
                        'pricePerUnit' => (float)$order['total'] / (int)($order['quantity'] ?: 1),
                        'total' => (float)$order['total']
                    ]
                ]
            ];
        }

        echo json_encode($formattedOrders);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error fetching orders: " . $e->getMessage()]);
    }
}

function updateOrderStatus($pdo) {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->id) || !isset($data->status)) {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data"]);
        return;
    }

    try {
        $sql = "UPDATE compras SET estado = :status WHERE id_compra = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':id', $data->id);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Order status updated"]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update order status"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error updating order: " . $e->getMessage()]);
    }
}
?>
