<?php
require 'vendor/autoload.php'; // Include Composer's autoloader

$input = json_decode(file_get_contents('php://input'), true);

$client = new MongoDB\Client("mongodb://localhost:27017");
$collection = $client->TORN->credentials;

$credential = $collection->findOne(['id' => $input['id']]);

if ($credential) {
    // Verify the credential using WebAuthn library
    // ...

    echo json_encode(['success' => true, 'password'=>'71bd9e8b-d943-4cb7-a4aa-f107c741d720']);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid credential']);
}
?>
