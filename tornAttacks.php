<?php
require_once __DIR__ . '/vendor/autoload.php';

$collection = (new MongoDB\Client)->TORN->attacks;

$TORN_API_KEY = $_GET['key'];
$INTERVAL = 86400;
$aFirstDateTime = [];
$firstTimestamp = 0;
$count = $collection->countDocuments([]);
if($count == 0){
    $aFirstDateTime = [2024,5,25,0,0,0];
    $firstTimeStamp =mktime(0,0,0,$aFirstDateTime[1],$aFirstDateTime[2]+1,$aFirstDateTime[0]);
}
else{
    $doc = $collection->findOne([],['sort' => ["timestamp_started" => -1],'limit' => 1]);
    $aFirstDateTime = explode("-", date("Y-m-d-H-i-s", $doc->timestamp_started + 1));
    $firstTimeStamp = $doc->timestamp;
}
$nextDayTimestamp = mktime(0,0,0,$aFirstDateTime[1],$aFirstDateTime[2]+1,$aFirstDateTime[0]);

echo implode("-", $aFirstDateTime) . "\n";
$today = getdate();
$todayTimestamp = $today["0"];

$jsonLogs = json_decode(file_get_contents("https://api.torn.com/v2/user?selections=attacks&key=". $TORN_API_KEY ."&from=". $firstTimeStamp + 1 . "&to=" . $nextDayTimestamp -1 , false));

foreach ($jsonLogs->attacks as $property => $value)
    $collection->insertOne($value);
usleep(500000);
for ($t = $nextDayTimestamp; $t <= $todayTimestamp; $t += $INTERVAL){
    $jsonLogs = json_decode(file_get_contents("https://api.torn.com/v2/user?selections=attacks&key=". $TORN_API_KEY ."&from=". $t . "&to=" . $t + $INTERVAL), false);
    echo date("Y-m-d H:i:s", $t) . "<BR/>";
    foreach ($jsonLogs->attacks as $property => $value)
        $collection->insertOne($value);
    usleep(500000);
}
?>