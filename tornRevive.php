<?php
require_once __DIR__ . '/vendor/autoload.php';

$collection = (new MongoDB\Client)->TORN->revive;

$jsonLogs = json_decode(file_get_contents("https://tracker.dubertrand.fr/Revive.json" , false));

foreach ($jsonLogs as $property => $value)
    $collection->insertOne($value);

?>