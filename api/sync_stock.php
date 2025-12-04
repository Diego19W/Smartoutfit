<?php
include_once '../db_connection.php';

try {
    // Get all products
    $productsStmt = $pdo->query("SELECT id_producto FROM productos");
    $products = $productsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $updateCount = 0;
    
    foreach ($products as $product) {
        $productId = $product['id_producto'];
        
        // Get stock from stock table
        $stockStmt = $pdo->prepare("SELECT talla, stock FROM stock WHERE id_producto = ?");
        $stockStmt->execute([$productId]);
        $stockData = $stockStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Build stock_talla JSON
        $sizeStock = ['XS' => 0, 'S' => 0, 'M' => 0, 'L' => 0, 'XL' => 0];
        $totalStock = 0;
        
        foreach ($stockData as $s) {
            $sizeStock[$s['talla']] = (int)$s['stock'];
            $totalStock += (int)$s['stock'];
        }
        
        // Update productos table
        $updateStmt = $pdo->prepare("UPDATE productos SET stock_talla = ?, stock = ? WHERE id_producto = ?");
        $updateStmt->execute([json_encode($sizeStock), $totalStock, $productId]);
        
        $updateCount++;
    }
    
    echo "Successfully synced stock_talla for $updateCount products.<br>";
    echo "Stock data from 'stock' table has been copied to 'stock_talla' column in 'productos' table.";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
