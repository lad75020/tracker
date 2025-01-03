<?php
require 'vendor/autoload.php';
use MongoDB\Client;

    try {
        $id = $_GET['id'];
        $key = $_GET['key'];
        $data = json_decode(file_get_contents("https://api.torn.com/v2/market/$id/itemmarket?key=$key&offset=0"));

        $price = $data->itemmarket->item->average_price;

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
