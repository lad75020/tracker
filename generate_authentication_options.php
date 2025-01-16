<?php
require 'vendor/autoload.php'; // Include Composer's autoloader

use Webauthn\PublicKeyCredentialRequestOptions;

$publicKeyCredentialRequestOptions = new PublicKeyCredentialRequestOptions(
    bin2hex(random_bytes(32)),
    60000,
    ['tracker.dubertrand.fr'],
    'ladparis'
);

echo json_encode($publicKeyCredentialRequestOptions);
?>
