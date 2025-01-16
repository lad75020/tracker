<?php
require 'vendor/autoload.php'; // Include Composer's autoloader

$client = new MongoDB\Client("mongodb://localhost:27017");
$collection = $client->TORN->users;

$passkey = password_hash('mypassword', PASSWORD_DEFAULT);

$collection->insertOne([
    'username' => 'ladparis',
    'passkey' => $passkey
]);

echo "User inserted successfully.";
?>
