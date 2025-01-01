<?php
require_once __DIR__ . '/vendor/autoload.php';
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

$collection = (new MongoDB\Client)->PLEX->events;

$object = json_decode(json_encode($_POST, JSON_FORCE_OBJECT), false);
$payload = json_decode($object->payload);
$payload->date = date(DATE_RFC2822);
if (isset($payload->event))
    $collection->insertOne($payload) or file_put_contents("log.txt", "\nErreur: " . error_get_last()['message'], FILE_APPEND);
if (isset($payload->event) && $payload->event == "media.play") {
    $ch = curl_init();
    curl_setopt_array(
        $ch,
        array(
            CURLOPT_URL => 'http://192.168.1.3:32400/status/sessions',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET'
        )
    );
    $status = curl_exec($ch) or file_put_contents("log.txt", "\nErreur: " . curl_error($ch), FILE_APPEND);
    $collection = (new MongoDB\Client)->PLEX->sessions;
    $collection->insertOne(json_decode(jsonOut($status)));
    
    curl_close($ch);
}
?>