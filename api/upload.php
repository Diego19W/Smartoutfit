<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
header("Access-Control-Allow-Origin: $origin");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Pragma, Cache-Control");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error logging
error_log("=== Upload PHP Started ===");
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Files received: " . print_r($_FILES, true));

$target_dir = "../uploads/";

// Check if directory exists, create if not
if (!file_exists($target_dir)) {
    error_log("Creating uploads directory...");
    if (mkdir($target_dir, 0777, true)) {
        error_log("Uploads directory created successfully");
        chmod($target_dir, 0777);
    } else {
        error_log("Failed to create uploads directory");
        http_response_code(500);
        echo json_encode(["message" => "Failed to create uploads directory", "error" => "Directory creation failed"]);
        exit();
    }
} else {
    error_log("Uploads directory exists");
    // Ensure permissions
    chmod($target_dir, 0777);
}

// Check if writable
if (!is_writable($target_dir)) {
    error_log("Uploads directory is not writable");
    http_response_code(500);
    echo json_encode(["message" => "Uploads directory is not writable", "error" => "Permission denied"]);
    exit();
}

if (!isset($_FILES["image"])) {
    error_log("No file uploaded - FILES array: " . print_r($_FILES, true));
    http_response_code(400);
    echo json_encode(["message" => "No file uploaded", "error" => "No image field in request"]);
    exit();
}

$file_error = $_FILES["image"]["error"];
if ($file_error !== UPLOAD_ERR_OK) {
    $error_messages = [
        UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
        UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'Upload stopped by extension',
    ];
    
    $error_msg = isset($error_messages[$file_error]) ? $error_messages[$file_error] : "Unknown upload error: $file_error";
    error_log("Upload error: $error_msg");
    http_response_code(400);
    echo json_encode(["message" => $error_msg, "error" => "Upload error code: $file_error"]);
    exit();
}

$file_name = basename($_FILES["image"]["name"]);
$file_tmp = $_FILES["image"]["tmp_name"];
$file_size = $_FILES["image"]["size"];

error_log("File name: $file_name");
error_log("File size: $file_size bytes");
error_log("Temp file: $file_tmp");

// Generate unique name
$target_file = $target_dir . uniqid() . "_" . $file_name;
$imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

error_log("Target file: $target_file");
error_log("File type: $imageFileType");

// Validate image
$check = getimagesize($file_tmp);
if ($check === false) {
    error_log("File is not a valid image");
    http_response_code(400);
    echo json_encode(["message" => "File is not an image", "error" => "Invalid image file"]);
    exit();
}

// Check file size (5MB limit)
if ($file_size > 5000000) {
    error_log("File too large: $file_size bytes");
    http_response_code(400);
    echo json_encode(["message" => "File is too large (max 5MB)", "error" => "File size: " . ($file_size / 1000000) . "MB"]);
    exit();
}

// Check file format
$allowed_types = ["jpg", "jpeg", "png", "gif", "webp"];
if (!in_array($imageFileType, $allowed_types)) {
    error_log("Invalid file type: $imageFileType");
    http_response_code(400);
    echo json_encode(["message" => "Only JPG, JPEG, PNG, GIF & WEBP files are allowed", "error" => "File type: $imageFileType"]);
    exit();
}

// Attempt to move uploaded file
error_log("Attempting to move file from $file_tmp to $target_file");
if (move_uploaded_file($file_tmp, $target_file)) {
    error_log("File uploaded successfully: $target_file");
    
    // Construct URL
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    $domainName = $_SERVER['HTTP_HOST'];
    $path = dirname($_SERVER['PHP_SELF']);
    $parentPath = dirname($path);
    $url = $protocol . $domainName . $parentPath . "/uploads/" . basename($target_file);
    
    error_log("Generated URL: $url");
    echo json_encode(["url" => $url, "message" => "Upload successful"]);
} else {
    error_log("Failed to move uploaded file");
    error_log("Source: $file_tmp");
    error_log("Destination: $target_file");
    error_log("Directory writable: " . (is_writable($target_dir) ? "yes" : "no"));
    
    http_response_code(500);
    echo json_encode([
        "message" => "Failed to upload file",
        "error" => "Could not move uploaded file",
        "debug" => [
            "tmp_file" => $file_tmp,
            "target" => $target_file,
            "dir_writable" => is_writable($target_dir)
        ]
    ]);
}
?>
