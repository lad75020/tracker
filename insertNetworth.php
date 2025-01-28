<?php
require_once __DIR__ . '/vendor/autoload.php';

$collection = (new MongoDB\Client)->TORN->Networth;




$collection->insertOne(json_decode(file_get_contents('php://input')));

    

?>