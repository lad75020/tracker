<?php
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'];
$passkey = $input['passkey'];

require 'vendor/autoload.php'; // Include Composer's autoloader

$client = new MongoDB\Client("mongodb://localhost:27017");
$collection = $client->TORN->users;

$user = $collection->findOne(['username' => $username]);

if ($user && password_verify($passkey, $user['passkey'])) {
    echo json_encode(['success' => true, 'authkey'=>$user['authkey']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}
?>
