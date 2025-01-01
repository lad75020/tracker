<?php
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client)->TORN->logs;

$aFilter = ['timestamp' => [ '$gt' => (int)$_GET['from'], '$lt' => (int)$_GET['to']]];

if(isset($_GET["category"])){
    $aFilter['category'] = $_GET["category"];
}
if(isset($_GET["crime_action"])){
    $aFilter['data.crime_action'] = $_GET["crime_action"];
}
if(isset($_GET["title"])){
    $aFilter['data.title'] = $_GET["title"];
}
if(isset($_GET["log"])){
    $aFilter['log'] = (int) $_GET["log"];
}

$options = [
    'sort' => ['timestamp' => 1]
];
$cLogs = $collection->find($aFilter, $options);

$result = [];
foreach ($cLogs as $doc) {
    $result[] = $doc;
}
echo json_encode($result);
?>