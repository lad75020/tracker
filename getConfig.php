<?php
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client)->TORN->config;
$options['projection'] = ['_id'=>0];
$options['sort'] = ['name' => 1];
$json = [];
foreach ($collection->find([], $options) as $doc) {
    array_push($json,$doc);
}
header('Content-Type: application/json');
echo json_encode($json);
?>