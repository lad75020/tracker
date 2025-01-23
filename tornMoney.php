<?php
require_once __DIR__ . '/vendor/autoload.php';

$collection = (new MongoDB\Client())->TORN->Money;

$jsonLogs = json_decode(file_get_contents("https://tracker.dubertrand.fr/Money.json" , false));
$count = count(get_object_vars($jsonLogs->cat13));
$i = 0;
foreach ($jsonLogs->cat13 as $property => $value){
    echo ($i++ / $count * 100). " %\n";
    $collection->insertOne($value);
}
    

?>