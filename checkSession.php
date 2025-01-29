<?php
session_start();

$response = array('session_active' => false);

if (isset($_SESSION['TornAPIKey'])) {
    $response['session_active'] = true;
}
header('Content-Type: application/json');
echo json_encode($response);
?>
