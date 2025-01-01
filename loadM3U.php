<?php
declare(strict_types=1);
require_once __DIR__ . '/vendor/autoload.php';
$opts = array('http' =>
array(
    'method'  => 'GET',
    'header'  => 'Connection: keep-alive',
    'user_agent' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0"
)
);
$context = stream_context_create($opts);
$collection = (new MongoDB\Client)->PLEX->media;

$m3ufile = file_get_contents("http://vip.sab-iptv.com:8000/get.php?username=98286526&password=HItcBTao7Bzi2h&type=m3u_plus&output=ts", false, $context);

$re = '/#EXTINF:(.+?)[,]\s?(.+?)[\r\n]+?((?:https?|rtmp):\/\/(?:\S*?\.\S*?)(?:[\s)\[\]{};"\'<]|\.\s|$))/';

$attributes = '/([a-zA-Z0-9\-\_]+?)="([^"]*)"/';

$m3ufile = str_replace('tvg-logo', 'thumb_square', $m3ufile);
$m3ufile = str_replace('tvg-id', 'id', $m3ufile);
$m3ufile = str_replace('tvg-name', 'author', $m3ufile);
$m3ufile = str_replace('group-title', 'group', $m3ufile);
$m3ufile = str_replace('tvg-country', 'country', $m3ufile);
$m3ufile = str_replace('tvg-language', 'language', $m3ufile);

preg_match_all($re, $m3ufile, $matches);

$items = array();

 foreach($matches[0] as $list) {
	 
   preg_match($re, $list, $matchList);

   $mediaURL = preg_replace("/[\n\r]/","",$matchList[3]);
   $mediaURL = preg_replace('/\s+/', '', $mediaURL);

   $newdata =  array (
    'title' => $matchList[2],
    'url' => $mediaURL
    );
    
    preg_match_all($attributes, $list, $matches, PREG_SET_ORDER);
    
    foreach ($matches as $match) {
       $newdata[$match[1]] = $match[2];
    }
    

	 
	 $items[] = $newdata;
    
 }

 
foreach ($items as $item){
$collection->insertOne($item) or file_put_contents("log.txt", "\nMongo Erreur: " . error_get_last()['message'], FILE_APPEND);
}