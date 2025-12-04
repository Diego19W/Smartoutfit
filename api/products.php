<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
header("Access-Control-Allow-Origin: $origin");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Pragma, Cache-Control");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../db_connection.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getProducts($pdo);
        break;
    case 'POST':
        createProduct($pdo);
        break;
    case 'PUT':
        updateProduct($pdo);
        break;
    case 'DELETE':
        deleteProduct($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;
}

function getProducts($pdo) {
    try {
        // Build query based on filters
        $sql = "SELECT * FROM productos WHERE 1=1";
        $params = [];

        if (isset($_GET['gender'])) {
            // Include unisex products when filtering by gender
            $sql .= " AND (genero = ? OR genero = 'unisex')";
            $params[] = $_GET['gender'];
        }

        if (isset($_GET['category'])) {
            $sql .= " AND categoria = ?";
            $params[] = $_GET['category'];
        }

        $sql .= " ORDER BY id_producto DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch stock for each product
        foreach ($products as &$product) {
            $stmtStock = $pdo->prepare("SELECT talla, stock FROM stock WHERE id_producto = ?");
            $stmtStock->execute([$product['id_producto']]);
            $stockData = $stmtStock->fetchAll(PDO::FETCH_ASSOC);

            $sizeStock = ['XS' => 0, 'S' => 0, 'M' => 0, 'L' => 0, 'XL' => 0];
            $totalStock = 0;
            foreach ($stockData as $s) {
                $sizeStock[$s['talla']] = (int)$s['stock'];
                $totalStock += (int)$s['stock'];
            }
            $product['sizeStock'] = $sizeStock;
            $product['stock'] = $totalStock;
            
            // Normalize fields for frontend
            $product['id'] = $product['id_producto'];
            $product['name'] = $product['nombre'];
            $product['category'] = $product['categoria'];
            $product['price'] = (float)$product['precio'];
            $product['image'] = $product['imagen_url'];
            $product['description'] = $product['descripcion'];
            $product['brand'] = $product['marca'];
            $product['gender'] = $product['genero'];
            $product['materials'] = $product['material'];
            // Colors are stored as comma separated string or JSON? Assuming simple text for now or we can parse if needed.
            // For now, let's just pass it. If it's a string "black, white", frontend might need to split it.
            // But wait, the frontend expects an array.
            $product['colors'] = $product['color'] ? explode(',', $product['color']) : [];
            
            // Handle multiple images
            $product['images'] = !empty($product['imagenes']) ? json_decode($product['imagenes']) : ($product['imagen_url'] ? [$product['imagen_url']] : []);
            
            // Status logic
            if ($totalStock === 0) {
                $product['status'] = 'out';
            } elseif ($totalStock < 10) {
                $product['status'] = 'low';
            } else {
                $product['status'] = 'active';
            }
        }

        echo json_encode($products);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error: " . $e->getMessage()]);
    }
}

function createProduct($pdo) {
    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->name) &&
        !empty($data->price)
    ) {
        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO productos (nombre, categoria, descripcion, marca, color, precio, imagen_url, imagenes, genero, material) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $colors = is_array($data->colors) ? implode(',', $data->colors) : $data->colors;
            $images = isset($data->images) ? json_encode($data->images) : json_encode([$data->image]);
            
            $stmt->execute([
                $data->name,
                $data->category,
                $data->description,
                $data->brand,
                $colors,
                $data->price,
                $data->image,
                $images,
                $data->gender,
                $data->materials
            ]);

            $productId = $pdo->lastInsertId();

            // Insert stock_talla and stock columns in productos table
            if (isset($data->sizeStock)) {
                $stockTallaJson = json_encode($data->sizeStock);
                $totalStock = array_sum((array)$data->sizeStock);
                $pdo->prepare("UPDATE productos SET stock_talla = ?, stock = ? WHERE id_producto = ?")
                    ->execute([$stockTallaJson, $totalStock, $productId]);
                
                // Insert into stock table
                $stmtStock = $pdo->prepare("INSERT INTO stock (id_producto, talla, stock) VALUES (?, ?, ?)");
                foreach ($data->sizeStock as $size => $qty) {
                    $stmtStock->execute([$productId, $size, $qty]);
                }
            }

            $pdo->commit();
            http_response_code(201);
            echo json_encode(["message" => "Product created.", "id" => $productId]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Unable to create product. " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }
}

function updateProduct($pdo) {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->id)) {
        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("UPDATE productos SET nombre = ?, categoria = ?, descripcion = ?, marca = ?, color = ?, precio = ?, imagen_url = ?, imagenes = ?, genero = ?, material = ? WHERE id_producto = ?");
            
            $colors = is_array($data->colors) ? implode(',', $data->colors) : $data->colors;
            $images = isset($data->images) ? json_encode($data->images) : json_encode([$data->image]);

            $stmt->execute([
                $data->name,
                $data->category,
                $data->description,
                $data->brand,
                $colors,
                $data->price,
                $data->image,
                $images,
                $data->gender,
                $data->materials,
                $data->id
            ]);

            // Update stock_talla column in productos table
            if (isset($data->sizeStock)) {
                $stockTallaJson = json_encode($data->sizeStock);
                $totalStock = array_sum((array)$data->sizeStock);
                $pdo->prepare("UPDATE productos SET stock_talla = ?, stock = ? WHERE id_producto = ?")
                    ->execute([$stockTallaJson, $totalStock, $data->id]);
            }

            // Update stock table (delete old and insert new for simplicity)
            $pdo->prepare("DELETE FROM stock WHERE id_producto = ?")->execute([$data->id]);

            if (isset($data->sizeStock)) {
                $stmtStock = $pdo->prepare("INSERT INTO stock (id_producto, talla, stock) VALUES (?, ?, ?)");
                foreach ($data->sizeStock as $size => $qty) {
                    $stmtStock->execute([$data->id, $size, $qty]);
                }
            }

            $pdo->commit();
            http_response_code(200);
            echo json_encode(["message" => "Product updated."]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Unable to update product. " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }
}

function deleteProduct($pdo) {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->id)) {
        try {
            // Cascade delete should handle stock if configured, otherwise delete stock first
            // In our conversion script we added ON DELETE CASCADE for some, let's ensure it works or do it manually
            // The conversion script added: ALTER TABLE `productos` ADD FOREIGN KEY (id_vendedor) REFERENCES `usuarios` (id) ON DELETE CASCADE;
            // But stock table might not have FK set up with cascade in the converted script?
            // Let's check the converted SQL... 
            // The converted SQL has: CREATE TABLE `stock` ... id_producto integer ...
            // It doesn't seem to have explicit FK constraint defined in the CREATE TABLE for stock in the snippet I saw.
            // So safe to delete manually.
            
            $pdo->beginTransaction();
            $pdo->prepare("DELETE FROM stock WHERE id_producto = ?")->execute([$data->id]);
            $pdo->prepare("DELETE FROM productos WHERE id_producto = ?")->execute([$data->id]);
            $pdo->commit();

            http_response_code(200);
            echo json_encode(["message" => "Product deleted."]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Unable to delete product. " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }
}
?>
