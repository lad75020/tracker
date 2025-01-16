<?php
require 'vendor/autoload.php'; // Include Composer's autoloader

$input = json_decode(file_get_contents('php://input'), true);

$client = new MongoDB\Client("mongodb://localhost:27017");
$collection = $client->TORN->credentials;

$credential = $collection->findOne(['id' => $input['id']]);

if ($credential) {
    // Verify the credential using WebAuthn library
    // ...

    echo json_encode(['success' => true, 'password'=>'']);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid credential']);
}
?>
