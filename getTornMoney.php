<?php
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client())->TORN->users;

if ($_SESSION['authkey'] != $collection->findOne(['username' => $_SESSION['username']])['authkey']) {

    die("Invalid session");
}
$collection = (new MongoDB\Client)->TORN->logs;
$aFilter = ['timestamp' => [ '$gt' => (int)$_GET['from'], '$lt' => (int)$_GET['to']]];
$aFilter['log'] = ['$in' => [9015,9052, 9056]];
$money = 0;
if(isset($_GET["crime_action"])){
    $aFilter['data.crime_action'] = ['$regex' => $_GET["crime_action"], '$options' => 'i'];
}
$options['projection'] = ['data.money_gained' => 1];
foreach ($collection->find($aFilter,$options) as $doc){
   $money += $doc->data->money_gained;
}
echo $money;
?>