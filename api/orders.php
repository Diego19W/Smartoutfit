<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
header("Access-Control-Allow-Origin: $origin");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Set timezone for all date operations
date_default_timezone_set('America/Mexico_City');

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

        // 3. Validate Stock and Prepare Email Items
        $emailItems = [];
        foreach ($data->items as $item) {
            // Get current product stock and name from stock table joined with products
            $checkStockSql = "SELECT s.stock, p.nombre FROM stock s JOIN productos p ON s.id_producto = p.id_producto WHERE s.id_producto = :id_producto AND s.talla = :talla";
            $checkStmt = $pdo->prepare($checkStockSql);
            $checkStmt->execute([
                ':id_producto' => $item->productId,
                ':talla' => $item->size
            ]);
            $stockRow = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$stockRow) {
                throw new Exception("Producto no encontrado: {$item->productId} talla {$item->size}");
            }
            
            $availableStock = (int)$stockRow['stock'];
            
            if ($availableStock < $item->quantity) {
                throw new Exception("Stock insuficiente para {$item->size}. Disponible: {$availableStock}, Solicitado: {$item->quantity}");
            }

            // Add to email items
            $emailItems[] = [
                'name' => $stockRow['nombre'],
                'size' => $item->size,
                'quantity' => $item->quantity,
                'price' => $item->price
            ];
        }

        $numero_orden = 'ORD-' . time() . '-' . rand(100, 999);
        $id_transaccion = 'TR-' . time() . '-' . rand(1000, 9999);
        $fecha_compra = date('Y-m-d H:i:s');
        
        // Calculate shipping: $200 if total < $2000, otherwise free
        $envio = $data->total < 2000 ? 200 : 0;

        // 4. Insert Order Items
        $sql = "INSERT INTO compras (id_usuario, id_producto, cantidad, total, envio, fecha_compra, numero_orden, id_transaccion, estado, talla) VALUES (:id_usuario, :id_producto, :cantidad, :total, :envio, :fecha_compra, :numero_orden, :id_transaccion, :estado, :talla)";
        $stmt = $pdo->prepare($sql);

        foreach ($data->items as $item) {
            // Insert order
            $stmt->bindValue(':id_usuario', $id_usuario);
            $stmt->bindValue(':id_producto', $item->productId);
            $stmt->bindValue(':cantidad', $item->quantity);
            $stmt->bindValue(':total', $item->price * $item->quantity);
            $stmt->bindValue(':envio', $envio);
            $stmt->bindValue(':fecha_compra', $fecha_compra);
            $stmt->bindValue(':numero_orden', $numero_orden);
            $stmt->bindValue(':id_transaccion', $id_transaccion);
            $stmt->bindValue(':estado', 'pendiente');
            $stmt->bindValue(':talla', $item->size);
            $stmt->execute();
            
            // Update stock in stock table
            $updateStockTableSql = "UPDATE stock SET stock = GREATEST(0, stock - :cantidad) WHERE id_producto = :id_producto AND talla = :talla";
            $updateStockTableStmt = $pdo->prepare($updateStockTableSql);
            $updateStockTableStmt->execute([
                ':cantidad' => $item->quantity,
                ':id_producto' => $item->productId,
                ':talla' => $item->size
            ]);
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

        // Send Confirmation Email
        require_once __DIR__ . '/email_helper.php';
        
        // Determine customer email and name
        $customerEmail = $data->customer->email ?? null;
        $customerName = ($data->customer->firstName ?? '') . ' ' . ($data->customer->lastName ?? '');
        
        // If user is logged in but customer data is missing in payload (shouldn't happen with current frontend), fetch from DB
        if (!$customerEmail && $id_usuario) {
             $userStmt = $pdo->prepare("SELECT email, nombre FROM usuarios WHERE id = :id");
             $userStmt->execute([':id' => $id_usuario]);
             $userRow = $userStmt->fetch(PDO::FETCH_ASSOC);
             $customerEmail = $userRow['email'];
             $customerName = $userRow['nombre'];
        }

        if ($customerEmail) {
            $orderData = [
                'numero_orden' => $numero_orden,
                'fecha_compra' => $fecha_compra,
                'customer_name' => $customerName,
                'items' => $emailItems,
                'shipping' => $envio,
                'total' => $finalTotal
            ];
            
            // Attempt to send email, log error if fails but don't fail the order
            if (!sendOrderConfirmationEmail($customerEmail, $orderData)) {
                error_log("Failed to send confirmation email to $customerEmail");
            } else {
                error_log("Confirmation email sent to $customerEmail");
            }
        }
        
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
        // If action=all is passed, fetch ALL orders (for admin)
        $action = isset($_GET['action']) ? $_GET['action'] : null;
        $userId = isset($_GET['user_id']) ? $_GET['user_id'] : (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null);
        
        $sql = "SELECT 
                    c.id_compra as id,
                    c.numero_orden as orderNumber,
                    p.nombre as productName,
                    p.imagen_url as productImage,
                    c.cantidad as quantity,
                    c.fecha_compra as date,
                    c.total,
                    c.envio,
                    c.estado as status,
                    'Tarjeta' as paymentMethod,
                    c.talla as size
                FROM compras c
                JOIN productos p ON c.id_producto = p.id_producto";
        
        // Only filter by user if action is not 'all' (admin mode)
        if ($action !== 'all' && $userId) {
            $sql .= " WHERE c.id_usuario = :user_id";
        }
        
        $sql .= " ORDER BY c.fecha_compra DESC";
                
        $stmt = $pdo->prepare($sql);
        
        if ($action !== 'all' && $userId) {
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
                'shipping' => (float)($order['envio'] ?? 0),
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
        $pdo->beginTransaction();

        // Get current order status and details
        $sql = "SELECT estado, id_producto, talla, cantidad 
                FROM compras 
                WHERE id_compra = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $data->id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            throw new Exception("Order not found");
        }

        $oldStatus = $order['estado'];
        $newStatus = $data->status;
        $stockReturned = false;

        // If changing to "cancelado" - return stock
        if ($newStatus === 'cancelado' && $oldStatus !== 'cancelado') {
            // Return stock to inventory using the stock table
            $updateStockSql = "UPDATE stock 
                              SET stock = stock + :cantidad 
                              WHERE id_producto = :id_producto 
                              AND talla = :talla";
            $updateStmt = $pdo->prepare($updateStockSql);
            $updateStmt->execute([
                ':cantidad' => $order['cantidad'],
                ':id_producto' => $order['id_producto'],
                ':talla' => $order['talla']
            ]);

            $stockReturned = true;
            error_log("Stock returned: Product {$order['id_producto']}, Size {$order['talla']}, Quantity {$order['cantidad']}");
        }

        // Update order status
        $updateSql = "UPDATE compras SET estado = :status WHERE id_compra = :id";
        $updateStmt = $pdo->prepare($updateSql);
        $updateStmt->execute([
            ':status' => $newStatus,
            ':id' => $data->id
        ]);

        $pdo->commit();
        
        echo json_encode([
            "message" => "Order status updated",
            "stockReturned" => $stockReturned
        ]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        error_log("Error updating order status: " . $e->getMessage());
        echo json_encode(["message" => "Error updating order: " . $e->getMessage()]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["message" => $e->getMessage()]);
    }
}
?>
