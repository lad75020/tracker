<?php
require_once __DIR__ . '/vendor/autoload.php';
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