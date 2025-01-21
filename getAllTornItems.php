<?php
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client())->TORN->users;

if ($_SESSION['authkey'] != $collection->findOne(['username' => $_SESSION['username']])['authkey']) {

    die("Invalid session");
}

use MongoDB\Client;

function getAllDocuments($databaseName, $collectionName) {
    try {
        // Connect to the MongoDB server
        $client = new Client("mongodb://localhost:27017");

        // Select the database and collection
        $collection = $client->$databaseName->$collectionName;

        // Retrieve all documents from the collection
        $documents = $collection->find()->toArray();

        // Convert the documents to a JSON string
        $json = json_encode($documents);

        // Return the JSON string
        return $json;
    } catch (Exception $e) {
        return json_encode(['error' => $e->getMessage()]);
    }
}

// Example usage
$databaseName = 'TORN';
$collectionName = 'Items';
header('Content-Type: application/json');
echo getAllDocuments($databaseName, $collectionName);
?>
