<?php
function sendOrderConfirmationEmail($to, $orderData) {
    $subject = "Confirmación de Pedido - MODAIX #" . $orderData['numero_orden'];
    
    // Construct HTML body
    $message = "
    <html>
    <head>
      <title>Confirmación de Pedido</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #eee; }
        .header { background-color: #000; color: #fff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; letter-spacing: 0.2em; font-size: 24px; }
        .content { padding: 30px; }
        .order-info { background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th { text-align: left; border-bottom: 2px solid #eee; padding: 10px; font-size: 12px; text-transform: uppercase; color: #888; }
        .table td { border-bottom: 1px solid #eee; padding: 10px; vertical-align: middle; }
        .total-section { text-align: right; margin-top: 20px; border-top: 2px solid #eee; padding-top: 20px; }
        .total-row { display: flex; justify-content: flex-end; margin-bottom: 5px; }
        .total-label { width: 150px; color: #666; }
        .total-value { width: 100px; font-weight: bold; }
        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class='container'>
        <div class='header'>
          <h1>MODAIX</h1>
        </div>
        <div class='content'>
          <p>Hola <strong>" . htmlspecialchars($orderData['customer_name']) . "</strong>,</p>
          <p>¡Gracias por tu compra! Tu pedido ha sido confirmado y está siendo procesado.</p>
          
          <div class='order-info'>
            <p style='margin: 0;'><strong>Número de Orden:</strong> " . $orderData['numero_orden'] . "</p>
            <p style='margin: 0;'><strong>Fecha:</strong> " . $orderData['fecha_compra'] . "</p>
          </div>
          
          <h3>Detalles del Pedido</h3>
          <table class='table'>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Talla</th>
                <th>Cant.</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>";
            
    foreach ($orderData['items'] as $item) {
        $message .= "
              <tr>
                <td>
                  <strong>" . htmlspecialchars($item['name']) . "</strong>
                </td>
                <td>" . htmlspecialchars($item['size']) . "</td>
                <td>" . $item['quantity'] . "</td>
                <td>$" . number_format($item['price'], 2) . "</td>
              </tr>";
    }
    
    $message .= "
            </tbody>
          </table>
          
          <div class='total-section'>
            <p><strong>Envío:</strong> $" . number_format($orderData['shipping'], 2) . "</p>
            <p style='font-size: 18px;'><strong>Total: $" . number_format($orderData['total'], 2) . "</strong></p>
          </div>
          
          <p style='margin-top: 30px;'>Te notificaremos por correo electrónico cuando tu pedido haya sido enviado.</p>
        </div>
        <div class='footer'>
          <p>&copy; " . date('Y') . " MODAIX. Todos los derechos reservados.</p>
          <p>Si tienes alguna pregunta, responde a este correo.</p>
        </div>
      </div>
    </body>
    </html>
    ";

    // Headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: MODAIX <noreply@modaix.com>' . "\r\n";
    $headers .= 'Reply-To: support@modaix.com' . "\r\n";
    $headers .= 'X-Mailer: PHP/' . phpversion();

    // Send email
    // Note: This requires a configured mail server (sendmail/postfix) on the server.
    // For local XAMPP, you might need to configure sendmail.ini or use PHPMailer with SMTP.
    return mail($to, $subject, $message, $headers);
}
?>
