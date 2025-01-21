<?php
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client())->TORN->users;

if ($_SESSION['authkey'] != $collection->findOne(['username' => $_SESSION['username']])['authkey']) {

    die("Invalid session");
}
$collection = (new MongoDB\Client)->TORN->logs;

$aFilter = ['timestamp' => [ '$gt' => (int)$_GET['from'], '$lt' => (int)$_GET['to']]];

if(isset($_GET["category"])){
    $aFilter['category'] = $_GET["category"];
}
if(isset($_GET["crime_action"])){
    $aFilter['data.crime_action'] = ['$regex' => $_GET["crime_action"], '$options' => 'i'];
}
if(isset($_GET["title"])){
    $aFilter['title'] = ['$regex' => $_GET["title"], '$options' => 'i'];
}
if(isset($_GET["log"])){
    $aFilter['log'] = (int) $_GET["log"];
}
if(isset($_GET["position"])){
    if($_GET["position"] == "win")
        $aFilter['data.position'] = [ '$in' => ["1st", "2nd", "3rd"]];
    if($_GET["position"] == "lose")
        $aFilter['data.position'] = [ '$in' => ["4th", "5th", "6th"]];  
}

echo $collection->count($aFilter);

?>