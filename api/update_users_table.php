<?php
require_once __DIR__ . '/../db_connection.php';

try {
    // Check if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'usuarios'");
    $tableExists = $stmt->rowCount() > 0;

    if ($tableExists) {
        echo "Table 'usuarios' exists. Checking columns...\n";
        
        // Get existing columns
        $stmt = $pdo->query("DESCRIBE usuarios");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Add columns if they don't exist
        $alterSql = "ALTER TABLE usuarios ";
        $updates = [];
        
        if (!in_array('contraseña_hash', $columns)) {
            $updates[] = "ADD COLUMN contraseña_hash VARCHAR(255) NOT NULL AFTER email";
        }
        if (!in_array('telefono', $columns)) {
            $updates[] = "ADD COLUMN telefono VARCHAR(20) AFTER tipo_usuario";
        }
        if (!in_array('direccion', $columns)) {
            $updates[] = "ADD COLUMN direccion TEXT AFTER telefono";
        }
        if (!in_array('ciudad', $columns)) {
            $updates[] = "ADD COLUMN ciudad VARCHAR(100) AFTER direccion";
        }
        if (!in_array('estado', $columns)) {
            $updates[] = "ADD COLUMN estado VARCHAR(100) AFTER ciudad";
        }
        if (!in_array('codigo_postal', $columns)) {
            $updates[] = "ADD COLUMN codigo_postal VARCHAR(10) AFTER estado";
        }
        if (!in_array('fecha_registro', $columns)) {
            $updates[] = "ADD COLUMN fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP";
        }
        
        if (!empty($updates)) {
            $sql = $alterSql . implode(", ", $updates);
            $pdo->exec($sql);
            echo "Table 'usuarios' updated successfully.\n";
        } else {
            echo "Table 'usuarios' is already up to date.\n";
        }

        // Modify existing columns if needed (e.g., ensure email is unique)
        try {
            $pdo->exec("ALTER TABLE usuarios ADD UNIQUE (email)");
            echo "Added UNIQUE constraint to email.\n";
        } catch (PDOException $e) {
            // Ignore if already unique
        }

    } else {
        echo "Creating table 'usuarios'...\n";
        $sql = "CREATE TABLE usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            contraseña_hash VARCHAR(255) NOT NULL,
            tipo_usuario ENUM('cliente', 'vendedor', 'admin') DEFAULT 'cliente',
            telefono VARCHAR(20),
            direccion TEXT,
            ciudad VARCHAR(100),
            estado VARCHAR(100),
            codigo_postal VARCHAR(10),
            fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
            puntos INT DEFAULT 0
        )";
        $pdo->exec($sql);
        echo "Table 'usuarios' created successfully.\n";
    }

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
