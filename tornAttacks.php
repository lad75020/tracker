<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client())->TORN->users;

if ($_SESSION['authkey'] != $collection->findOne(['username' => $_SESSION['username']])['authkey']) {
    die("data: Invalid session\n\n");
}

$collection = (new MongoDB\Client)->TORN->attacks;

$TORN_API_KEY = $_SESSION['TornAPIKey'];
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
echo 'data: ' . implode("-", $aFirstDateTime)."\n\n";
ob_flush(); flush();

$today = getdate();
$todayTimestamp = $today["0"];

$jsonLogs = json_decode(file_get_contents("https://api.torn.com/v2/user?selections=attacks&key=". $TORN_API_KEY ."&from=". $firstTimeStamp + 1 . "&to=" . $nextDayTimestamp -1 , false));

// Supprimer les doublons basés sur la propriété 'code'
$uniqueLogs = [];
foreach ($jsonLogs->attacks as $property => $value) {
    if (!isset($uniqueLogs[$value->code])) {
        $uniqueLogs[$value->code] = $value;
        // Vérifier si le document existe déjà dans la collection
        if ($collection->countDocuments(['code' => $value->code]) == 0) {
            $collection->insertOne($value);
        }
    }
}
usleep(500000);
for ($t = $nextDayTimestamp; $t <= $todayTimestamp; $t += $INTERVAL){
    $jsonLogs = json_decode(file_get_contents("https://api.torn.com/v2/user?selections=attacks&key=". $TORN_API_KEY ."&from=". $t . "&to=" . $t + $INTERVAL), false);
    echo 'data: '.date("Y-m-d H:i:s", $t)."\n\n";
    ob_flush(); flush();
    // Supprimer les doublons basés sur la propriété 'code'
    $uniqueLogs = [];
    foreach ($jsonLogs->attacks as $property => $value) {
        if (!isset($uniqueLogs[$value->code])) {
            $uniqueLogs[$value->code] = $value;
            // Vérifier si le document existe déjà dans la collection
            if ($collection->countDocuments(['code' => $value->code]) == 0) {
                $collection->insertOne($value);
            }
        }
    }
    usleep(500000);
}
echo "event: end\n";
echo "data: End of stream\n\n";
ob_flush(); flush();
exit();
?>