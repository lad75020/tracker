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
$TORN_API_KEY = $_SESSION['TornAPIKey'];
$INTERVAL = 86400;
$collection = (new MongoDB\Client)->TORN->attacks;
$collection2 = (new MongoDB\Client)->TORN->operations;
$headers = [
    'http' => [
        'method' => 'GET',
        'header' => "Authorization: ApiKey $TORN_API_KEY\r\n"
                    
    ]
];

// Create a context with the headers
$context = stream_context_create($headers);

$aFirstDateTime = [];
$firstTimestamp = 0;
$count = $collection->countDocuments([]);
if($count == 0){
    $aFirstDateTime = [2024,5,25,0,0,0];
    $firstTimeStamp =mktime(0,0,0,$aFirstDateTime[1],$aFirstDateTime[2]+1,$aFirstDateTime[0]);
}
else{
    $doc = $collection2->findOne(["type" => "lastAttack"]);
    $aFirstDateTime = explode("-", date("Y-m-d-H-i-s", $doc->timestamp + 1));
    $firstTimeStamp = $doc->timestamp;
}
$nextDayTimestamp = mktime(0,0,0,$aFirstDateTime[1],$aFirstDateTime[2]+1,$aFirstDateTime[0]);
echo 'data: ' . implode("-", $aFirstDateTime)."\n\n";
ob_flush(); flush();

$today = getdate();
$todayTimestamp = $today["0"];

$jsonLogs = json_decode(file_get_contents("https://api.torn.com/v2/user/attacks?from=". $firstTimeStamp + 1 . "&to=" . $nextDayTimestamp -1 , false,$context));



foreach ($jsonLogs->attacks as $property => $value) {
        if ($collection->countDocuments(['code' => $value->code]) == 0) {
            $collection->insertOne($value);
        }
}
usleep(500000);
$count = 0;
for ($t = $nextDayTimestamp; $t <= $todayTimestamp; $t += $INTERVAL){
    $jsonLogs = json_decode(file_get_contents("https://api.torn.com/v2/user/attacks?from=". $t . "&to=" . $t + $INTERVAL, false,$context));

    foreach ($jsonLogs->attacks as $property => $value) {
            if ($collection->countDocuments(['code' => $value->code]) == 0) {
                $count++;
                $collection->insertOne($value);
        }
    }
    echo 'data: '.date("Y-m-d", $t).": $count\n\n";
    ob_flush(); flush();
    usleep(500000);
    $collection2->updateOne(["type" => "lastAttack"], ['$set' => ['timestamp' => $t]]);
}
echo "event: end\n";
echo "data: End of stream\n\n";
ob_flush(); flush();
exit();
?>