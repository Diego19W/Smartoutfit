<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
header("Access-Control-Allow-Origin: $origin");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Pragma, Cache-Control");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../db_connection.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit();
}

try {
    $analytics = [
        'salesByMonth' => getSalesByMonth($pdo),
        'topProducts' => getTopProducts($pdo),
        'ordersByStatus' => getOrdersByStatus($pdo),
        'revenueByMonth' => getRevenueByMonth($pdo)
    ];
    
    echo json_encode($analytics);
} catch (PDOException $e) {
    http_response_code(500);
    error_log("Analytics Error: " . $e->getMessage());
    echo json_encode(["message" => "Error fetching analytics: " . $e->getMessage()]);
}

function getSalesByMonth($pdo) {
    // Get sales for the last 6 months
    $sql = "SELECT 
                DATE_FORMAT(fecha_compra, '%Y-%m') as month,
                SUM(cantidad) as total_quantity
            FROM compras
            WHERE fecha_compra >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            AND estado != 'cancelado'
            GROUP BY DATE_FORMAT(fecha_compra, '%Y-%m')
            ORDER BY month ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the data for Chart.js
    $data = [];
    foreach ($results as $row) {
        $monthName = date('M Y', strtotime($row['month'] . '-01'));
        $data[] = [
            'month' => $monthName,
            'sales' => (int)$row['total_quantity']
        ];
    }
    
    return $data;
}

function getTopProducts($pdo) {
    // Get top 5 products by quantity sold
    $sql = "SELECT 
                p.nombre as product_name,
                SUM(c.cantidad) as total_sold
            FROM compras c
            JOIN productos p ON c.id_producto = p.id_producto
            WHERE c.estado != 'cancelado'
            GROUP BY c.id_producto, p.nombre
            ORDER BY total_sold DESC
            LIMIT 5";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $data = [];
    foreach ($results as $row) {
        $data[] = [
            'name' => $row['product_name'],
            'quantity' => (int)$row['total_sold']
        ];
    }
    
    return $data;
}

function getOrdersByStatus($pdo) {
    // Get orders grouped by status
    $sql = "SELECT 
                estado as status,
                COUNT(*) as count
            FROM compras
            GROUP BY estado";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $data = [
        'pendiente' => 0,
        'entregado' => 0,
        'cancelado' => 0
    ];
    
    foreach ($results as $row) {
        $status = $row['status'];
        if (isset($data[$status])) {
            $data[$status] = (int)$row['count'];
        }
    }
    
    return $data;
}

function getRevenueByMonth($pdo) {
    // Get revenue for the last 6 months
    $sql = "SELECT 
                DATE_FORMAT(fecha_compra, '%Y-%m') as month,
                SUM(total) as total_revenue
            FROM compras
            WHERE fecha_compra >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            AND estado != 'cancelado'
            GROUP BY DATE_FORMAT(fecha_compra, '%Y-%m')
            ORDER BY month ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $data = [];
    foreach ($results as $row) {
        $monthName = date('M Y', strtotime($row['month'] . '-01'));
        $data[] = [
            'month' => $monthName,
            'revenue' => (float)$row['total_revenue']
        ];
    }
    
    return $data;
}
?>
