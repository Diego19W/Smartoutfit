<?php
include_once '../db_connection.php';

try {
    // Add columns if they don't exist
    $columns = [
        "ADD COLUMN IF NOT EXISTS `cantidad` INT DEFAULT 1",
        "ADD COLUMN IF NOT EXISTS `talla` VARCHAR(10) DEFAULT 'M'",
        "ADD COLUMN IF NOT EXISTS `estado` VARCHAR(20) DEFAULT 'pendiente'",
        "ADD COLUMN IF NOT EXISTS `numero_orden` VARCHAR(50)"
    ];

    // Add categoria to products if not exists
    $sql = "ALTER TABLE `productos` ADD COLUMN IF NOT EXISTS `categoria` VARCHAR(50)";
    try {
        $pdo->exec($sql);
        echo "Executed: $sql <br>";
    } catch (PDOException $e) {
        echo "Error (might be expected): " . $e->getMessage() . "<br>";
    }

    foreach ($columns as $col) {
        $sql = "ALTER TABLE `compras` " . $col;
        try {
            $pdo->exec($sql);
            echo "Executed: $sql <br>";
        } catch (PDOException $e) {
            // Ignore if column already exists (MySQL < 8.0 might not support IF NOT EXISTS in ALTER TABLE)
            // So we catch the error.
            echo "Error (might be expected if column exists): " . $e->getMessage() . "<br>";
        }
    }
    
    // Also update numero_orden for existing rows if empty
    $sql = "UPDATE `compras` SET `numero_orden` = CONCAT('ORD-', `id_compra`) WHERE `numero_orden` IS NULL";
    $pdo->exec($sql);
    echo "Updated existing orders with default order numbers.<br>";

    echo "Schema update completed.";

} catch (PDOException $e) {
    echo "Error updating schema: " . $e->getMessage();
}
?>
