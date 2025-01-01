<?php

$curl = curl_init();

curl_setopt_array($curl, array(
    CURLOPT_URL => 'http://192.168.1.3:32400/video/:/transcode/universal/start.mpd?hasMDE=true&path=/media/GDrive/Movies/Ad.Astra.mp4&mediaIndex=0&partIndex=0&protocol=hls',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'GET'
)
);

$response = curl_exec($curl);
echo $response . curl_error($curl);
curl_close($curl);