<?php
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client())->TORN->users;

if ($_SESSION['authkey'] != $collection->findOne(['username' => $_SESSION['username']])['authkey']) {

    die("Invalid session");
}
$collection = (new MongoDB\Client)->TORN->attacks;
$attacks=0;
$defends=0;
$wins=0;
$losses=0;
$aFilter = ['started' => [ '$gt' => (int)$_GET['from'], '$lt' => (int)$_GET['to']]];
$options['projection'] = ['_id'=> 0, 'code'=> 0];
foreach ($collection->find($aFilter, $options) as $doc){
    if ($doc->attacker->id == 3305509){
        $attacks++;
        if( !in_array( $doc->result, ["Lost"]))
            $wins++;
        else
            $losses++;

    }
    else{
        $defends++;
        if( in_array( $doc->result, ["Lost"]))
            $wins++;
        else
            $losses++;
    }
    
}
header('Content-Type: application/json');
echo json_encode(['wins'=> $wins,'losses'=> $losses,'attacks'=> $attacks,'defends'=> $defends]);

?>