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
$collection = (new MongoDB\Client)->TORN->Items;


for ($itemID = 1160; $itemID <= 999999; $itemID++){
    $jsonItem = json_decode(file_get_contents("https://api.torn.com/v2/market?selections=itemmarket&id=". $itemID , false,$context));
    if (isset($jsonItem->error)){
        die($jsonItem->error->error);
    }
    else{
        $jsonLightItem = new stdClass();
        $jsonLightItem->id= $itemID;
        $jsonLightItem->name = $jsonItem->itemmarket->item->name;
        $jsonLightItem->type = $jsonItem->itemmarket->item->type;
        $jsonLightItem->price = $jsonItem->itemmarket->listings[0]->price;        
        $collection->insertOne($jsonLightItem);
        echo $jsonLightItem->name . " inserted<BR/>";
    }
        
    usleep(100000);
}
?>