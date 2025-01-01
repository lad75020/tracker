<?php
require_once __DIR__ . '/vendor/autoload.php';

$collection = (new MongoDB\Client)->TORN->Stats;

$jsonLogs = json_decode(file_get_contents("https://tracker.dubertrand.fr/Stats.json" , false));

foreach ($jsonLogs as $property => $value){
    echo json_encode($value)."<BR/>";
    $collection->insertOne($value);
}
    

?>