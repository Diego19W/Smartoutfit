<?php
include_once '../db_connection.php';

try {
    $sql = "ALTER TABLE usuarios ADD COLUMN puntos INT DEFAULT 0";
    $pdo->exec($sql);
    echo "Column 'puntos' added successfully to 'usuarios' table.";
} catch (PDOException $e) {
    echo "Error adding column: " . $e->getMessage();
}
?>
