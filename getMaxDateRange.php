<?php
session_start([ 'cookie_secure' => true,'cookie_httponly' => true, 'cookie_samesite' => 'Strict'  ]);
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client())->TORN->users;

if ($_SESSION['authkey'] != $collection->findOne(['username' => $_SESSION['username']])['authkey']) {

    die("Invalid session");
}
$collection = (new MongoDB\Client)->TORN->logs;
$options['projection'] = ['timestamp'=>1];
$options['sort'] = ['timestamp' => 1];
$options['limit'] = 1;
$firstDoc = $collection->findOne([], $options);
$options['sort'] = ['timestamp' => -1];
$lastDoc = $collection->findOne([], $options);
$range = new stdClass();
$range->firstTimestamp = $firstDoc->timestamp;
$range->lastTimestamp = $lastDoc->timestamp;
header('Content-Type: application/json');
echo json_encode($range);
?>