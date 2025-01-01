<?php
require_once __DIR__ . '/vendor/autoload.php';
$opts = array('http' =>
array(
    'method'  => 'GET',
    'header'  => 'Connection: keep-alive',
    'user_agent' => "\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0"
)
);
$collection = (new MongoDB\Client)->PLEX->epg;
$context = stream_context_create($opts);
$epg=file_get_contents("http://vip.sab-iptv.com:8000/xmltv.php?username=98286526&password=HItcBTao7Bzi2h",false, $context);

function json2xml($domNode)
{
    foreach ($domNode->childNodes as $node) {
        if ($node->hasChildNodes()) {
            json2xml($node);
        } else {
            if ($domNode->hasAttributes()) {
                $domNode->setAttribute("nodeValue", $node->textContent);
                $node->nodeValue = "";
            }
        }
    }
}

function jsonOut($string)
{
    $dom = new DOMDocument();
    $dom->loadXML($string);
    json2xml($dom);
    return str_replace("@", "", json_encode(simplexml_load_string($dom->saveXML()), JSON_PRETTY_PRINT));
}
$EPGJSONObj = json_decode(jsonOut($epg));
//file_put_contents("log.txt", jsonOut($epg), FILE_APPEND);
$EPGJSONObj->attributes = null;

foreach ($EPGJSONObj->channel as $EPGChannelItem){
$collection->insertOne($EPGChannelItem);
}
foreach ($EPGJSONObj->programme as $EPGProgramItem){
    $collection->insertOne($EPGProgramItem);
}
