<?php
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client())->TORN->users;

if ($_SESSION['authkey'] != $collection->findOne(['username' => $_SESSION['username']])['authkey']) {
    die("Invalid session");
}

    try {
        $id = $_GET['id'];
        $key = $_SESSION['TornAPIKey'];
        $data = json_decode(file_get_contents("https://api.torn.com/v2/market/$id/itemmarket?key=$key&offset=0"));

        $price = $data->itemmarket->listings[0]->price;

        // Connect to the MongoDB server
        $collection = (new MongoDB\Client)->TORN->Items;

        // Update the price in the MongoDB document
        $result = $collection->updateOne(
            ['id' => (int)$id],
            ['$set' => ['price' => $price]]
        );
        echo $price;
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }

?>
