<?php
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client())->TORN->users;
$TORN_API_KEY = $_SESSION['TornAPIKey'];

if ($_SESSION['authkey'] != $collection->findOne(['username' => $_SESSION['username']])['authkey']) {

    die("Invalid session");
}
$headers = [
    'http' => [
        'method' => 'GET',
        'header' => "Authorization: ApiKey $TORN_API_KEY\r\n"
                    
    ]
];

// Create a context with the headers
$context = stream_context_create($headers);
$collection = (new MongoDB\Client)->TORN->Networth;
$twentyFourHoursAgo = new DateTime();
$twentyFourHoursAgo->modify('-12 hours');
$twentyFourHoursAgoBSON = new MongoDB\BSON\UTCDateTime($twentyFourHoursAgo);

// Check if a document with a date less than 24 hours ago exists
$existingDocument = $collection->findOne(['date' => ['$gte' => $twentyFourHoursAgoBSON]]);

if ($existingDocument) {
    die("A document with a date less than 24 hours ago already exists.");
}

$networth = json_decode(file_get_contents("https://api.torn.com/v2/user/personalstats?cat=networth" , false,$context));
$lightNetworth = new stdClass();
$lightNetworth->date = new MongoDB\BSON\UTCDateTime(new DateTime());
$lightNetworth->value = $networth->personalstats->networth->total;
    
$collection->insertOne($lightNetworth);
?>