<?php
require_once __DIR__ . '/vendor/autoload.php';
$collection = (new MongoDB\Client)->TORN->logs;
$aFilter = ['timestamp' => [ '$gt' => (int)$_GET['from'], '$lt' => (int)$_GET['to']]];

$aFilter['log'] = ['$in' => [9005,9006]];
$skill = 0;

$options = ['sort' => ['timestamp'=> 1]];
$skills = new stdClass();
$crimeMapping = [
    "search for cash" => "searching",
    "bootlegging" => "bootlegging",
    "shoplifting" => "shoplifting",
    "burglary" => "burglary",
    "graffiti" => "graffiti",
    "cracking" => "cracking",
    "forgery" => "forgery",
    "pickpocketing" => "pickpocketing",
    "skimming" => "skimming",
    "hustling" => "hustling"
];
foreach ($collection->find($aFilter, $options) as $doc) {
    $crime = $doc->data->crime;
    if (isset($crimeMapping[$crime])) {
        $skills->{$crimeMapping[$crime]} = $doc->data->skill_level;
    }
}
header('Content-Type: application/json');
echo json_encode($skills);
?>