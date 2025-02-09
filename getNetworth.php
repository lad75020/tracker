<?php
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client())->TORN->users;

if ($_SESSION['authkey'] != $collection->findOne(['username' => $_SESSION['username']])['authkey']) {

    die("Invalid session");
}
$collection = (new MongoDB\Client)->TORN->Networth;
$options['projection'] = ['_id'=>0];

$json = [];
foreach ($collection->find([], $options) as $doc) {
    $jsonItem = new stdClass();
    $jsonItem->date = $doc->date->toDateTime()->format(DateTime::ISO8601);
    $jsonItem->value =$doc->value;
    array_push($json, $jsonItem);
}
header('Content-Type: application/json');
echo json_encode($json);
?>