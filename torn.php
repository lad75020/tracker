<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
require_once __DIR__ . '/vendor/autoload.php';

$collection = (new MongoDB\Client)->TORN->logs;
$doc = $collection->findOne([],['sort' => ["timestamp" => -1],'limit' => 1]);

$TORN_API_KEY = $_GET['key'];
$INTERVAL = 900;

$aFirstDateTime = explode("-", date("Y-m-d-H-i-s", $doc->timestamp + 1));
$endFirstLoopMinute = 0;
$endFirstLoopHour = $aFirstDateTime[3];
if ($aFirstDateTime[4] >= 0 && $aFirstDateTime[4] < 15)
    $endFirstLoopMinute = 15;
if ($aFirstDateTime[4] >= 15 && $aFirstDateTime[4] < 30)
    $endFirstLoopMinute = 30;
if ($aFirstDateTime[4] >= 30 && $aFirstDateTime[4] < 45)
    $endFirstLoopMinute = 45;
if ($aFirstDateTime[4] >= 45 && $aFirstDateTime[4] <= 59){
    $endFirstLoopMinute = 0;
    $endFirstLoopHour = ($aFirstDateTime[3] < 23 ) ? $aFirstDateTime[3] +1 : 0;
}
$endFirstLoopTimestamp = mktime($endFirstLoopHour, $endFirstLoopMinute,0,$aFirstDateTime[1],$aFirstDateTime[2],$aFirstDateTime[0]);

echo 'data: '. implode("-", $aFirstDateTime)."\n\n";
ob_flush(); flush();
$today = getdate();
$todayTimestamp = $today["0"];

$jsonLogs = json_decode(file_get_contents("https://api.torn.com/v2/user?selections=log&key=". $TORN_API_KEY ."&from=". $doc->timestamp + 1 . "&to=" . $endFirstLoopTimestamp), false);

foreach ($jsonLogs->log as $property => $value){
    $bsonDate =  new MongoDB\BSON\UTCDateTime($value->timestamp * 1000);
    $value->date = $bsonDate;
    $collection->insertOne($value);
}
usleep(500000);
for ($t = $endFirstLoopTimestamp; $t <= $todayTimestamp; $t += $INTERVAL){
    $jsonLogs = json_decode(file_get_contents("https://api.torn.com/v2/user?selections=log&key=". $TORN_API_KEY ."&from=". $t . "&to=" . $t + $INTERVAL), false);
    echo 'data: ' . date("Y-m-d H:i:s", $t)."\n\n";
    ob_flush(); flush();
    foreach ($jsonLogs->log as $property => $value){
        $bsonDate =  new MongoDB\BSON\UTCDateTime($value->timestamp * 1000);
        $value->date = $bsonDate;
        $collection->insertOne($value);
    }
    usleep(500000);
}
echo "event: end\n";
echo "data: End of stream\n\n";
ob_flush(); flush();
?>