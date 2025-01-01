<?php
require_once __DIR__ . '/vendor/autoload.php';

$collection = (new MongoDB\Client())->TORN->logs;

$options['projection'] = ['_id'=>1,"timestamp"=>1];

foreach ($collection->find(["date"=>['$exists' => false]], $options) as $doc) {
    $bsonDate =  new MongoDB\BSON\UTCDateTime($doc->timestamp * 1000);
    $result = $collection->updateOne(
        ['_id' => $doc->_id],
        ['$set' => ['date' => $bsonDate]]
    );
}
?>