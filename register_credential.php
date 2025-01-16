<?php
require 'vendor/autoload.php'; // Include Composer's autoloader

$input = json_decode(file_get_contents('php://input'), true);

$client = new MongoDB\Client("mongodb://localhost:27017");
$collection = $client->mydatabase->credentials;

$collection->insertOne([
    'id' => $input['id'],
    'rawId' => $input['rawId'],
    'type' => $input['type'],
    'response' => $input['response']
]);

echo json_encode(['success' => true]);
?>
