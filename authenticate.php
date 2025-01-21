<?php
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'];
$passkey = $input['passkey'];

require 'vendor/autoload.php';
use Ramsey\Uuid\Uuid;

$client = new MongoDB\Client("mongodb://localhost:27017");
$collection = $client->TORN->users;

$user = $collection->findOne(['username' => $username]);

if ($user && password_verify($passkey, $user['passkey'])) {
    $uuid = Uuid::uuid6();
    $collection->updateOne(['username' => $username], ['$set' => ['authkey' => $uuid->toString()]]);
    $_SESSION['username'] = $username;
    $_SESSION['authkey'] = $uuid->toString();
    $_SESSION['TornAPIKey'] = $user->TornAPIKey;
    echo json_encode(['success' => true, 'TornAPIKey'=>$user->TornAPIKey,'TornUserID'=>$user->TornUserID]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}
?>
