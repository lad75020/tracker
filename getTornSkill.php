<?php
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client())->TORN->users;

if ($_SESSION['authkey'] != $collection->findOne(['username' => $_SESSION['username']])['authkey']) {

    die("Invalid session");
}
$collection = (new MongoDB\Client)->TORN->logs;
$aFilter = ['timestamp' => [ '$gt' => (int)$_GET['from'], '$lt' => (int)$_GET['to']]];

$aFilter['log'] = ['$in' => [9005,9006]];
$skill = 0;

if(isset($_GET["crime"])){
    $aFilter['data.crime'] = $_GET["crime"];
}
$options = ['sort' => ['timestamp'=> 1]];
$options['limit'] = 1;
$doc = $collection->findOne($aFilter, $options);
echo $doc->data->skill_level;

?>