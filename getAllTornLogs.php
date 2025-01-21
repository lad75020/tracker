<?php
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client())->TORN->users;

if ($_SESSION['authkey'] != $collection->findOne(['username' => $_SESSION['username']])['authkey']) {

    die("Invalid session");
}
$collection = (new MongoDB\Client)->TORN->logs;
$options ["projection"] = [ "_id"=> ['$toString' => '$_id'], "log" => 1,"title" =>1, "timestamp" => 1, "category" => 1, "data" => 1, "params" => 1];
$result = [];
foreach ($collection->find(['timestamp' => ['$gte' => (int)$_GET['from']]] ,$options) as $doc){
    array_push($result, $doc);
}
header ('Content-Type: application/json');
echo json_encode($result);
?>