<?php
include_once '../db_connection.php';

try {
    $sql = "SELECT id_producto, nombre, stock, stock_talla FROM productos LIMIT 10";
    $stmt = $pdo->query($sql);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h3>Productos y Stock</h3>";
    echo "<table border='1'>";
    echo "<tr><th>ID</th><th>Nombre</th><th>Stock Total</th><th>Stock por Talla (stock_talla)</th></tr>";
    
    foreach ($products as $product) {
        echo "<tr>";
        echo "<td>{$product['id_producto']}</td>";
        echo "<td>{$product['nombre']}</td>";
        echo "<td>{$product['stock']}</td>";
        echo "<td>" . ($product['stock_talla'] ?: 'NULL/EMPTY') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<br><h3>Stock table</h3>";
    $sqlStock = "SELECT * FROM stock LIMIT 10";
    $stmtStock = $pdo->query($sqlStock);
    $stockData = $stmtStock->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1'>";
    echo "<tr><th>ID</th><th>Producto ID</th><th>Talla</th><th>Stock</th></tr>";
    foreach ($stockData as $s) {
        echo "<tr>";
        echo "<td>{$s['id']}</td>";
        echo "<td>{$s['id_producto']}</td>";
        echo "<td>{$s['talla']}</td>";
        echo "<td>{$s['stock']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
