<?php
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client)->TORN->attacks;
$attacks=0;
$defends=0;
$wins=0;
$losses=0;
$aFilter = ['timestamp_started' => [ '$gt' => (int)$_GET['from'], '$lt' => (int)$_GET['to']]];
$options['projection'] = ['_id'=> 0, 'code'=> 0];
foreach ($collection->find($aFilter, $options) as $doc){
    if ($doc->attacker_id == 3305509){
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