<?php
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client)->TORN->logs;
$aFilter = ['timestamp' => [ '$gt' => (int)$_GET['from'], '$lt' => (int)$_GET['to']]];

$aFilter['log'] = ['$in' => [6264,6220,6221,5963]];
$work_stats = ['manual'=> 0,'intelligence' => 0,'endurance' => 0,'trains'=>0];

$options = ['sort' => ['timestamp'=> 1]];
$options['projection'] = ['data.working_stats_received' => 1,"log"=>1];
foreach ($collection->find($aFilter, $options) as $doc){
    if($doc->log == 6264)
        $work_stats['trains']++;
    $docStats = explode(",",$doc->data->working_stats_received);
    if(isset($docStats[0]))
        $work_stats['manual'] += (int)$docStats[0];
    if(isset($docStats[1]))
        $work_stats['intelligence'] += (int)$docStats[1];
    if(isset($docStats[2]))
        $work_stats['endurance'] += (int)$docStats[2];
}
header('Content-Type: application/json');
echo json_encode($work_stats);
?>