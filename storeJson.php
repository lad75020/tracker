<?php
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client)->TORN->config;

$collection->insertMany(json_decode($_POST["json"]));
?>