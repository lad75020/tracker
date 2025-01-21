<?php
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client())->TORN->users;

if ($_SESSION['authkey'] != $collection->findOne(['username' => $_SESSION['username']])['authkey']) {

    die("Invalid session");
}
$collection = (new MongoDB\Client)->TORN->logs;
$aFilter = [
        'timestamp' => ['$gt' => (int)$_GET['from'], '$lt' => (int)$_GET['to']],
        'category' => 'Gym',
    ];
$options = ['sort' => ['timestamp' => -1]];
$options['projection'] = ['data' => 1];
$stat = ['energy_used' => 0];
foreach ($collection->find($aFilter, $options) as $doc){

        if (isset($doc->data->speed_after))     $stat['speed'] = (int)$doc->data->speed_after;
        if (isset($doc->data->defense_after))   $stat['defense'] = (int)$doc->data->defense_after;
        if (isset($doc->data->dexterity_after)) $stat['dexterity'] = (int)$doc->data->dexterity_after;
        if (isset($doc->data->strength_after))  $stat['strength'] = (int)$doc->data->strength_after;
        $stat['energy_used'] += $doc->data->energy_used;
}
if($stat["energy_used"] == 0)
        $stat = [];
header('Content-Type: application/json');
echo json_encode($stat);
?>