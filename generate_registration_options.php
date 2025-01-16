<?php
require 'vendor/autoload.php'; // Include Composer's autoloader

use Webauthn\PublicKeyCredentialCreationOptions;
use Webauthn\PublicKeyCredentialRpEntity;
use Webauthn\PublicKeyCredentialUserEntity;
use Webauthn\AuthenticatorSelectionCriteria;
use Webauthn\PublicKeyCredentialParameters;
use Webauthn\PublicKeyCredentialDescriptor;

$rpEntity = new PublicKeyCredentialRpEntity('example.com', 'Example');
$userEntity = new PublicKeyCredentialUserEntity('user-id', 'username', 'User Name');

$publicKeyCredentialCreationOptions = new PublicKeyCredentialCreationOptions(
    $rpEntity,
    $userEntity,
    bin2hex(random_bytes(32)),
    [new PublicKeyCredentialParameters('public-key', -7)],
    60000,
    new AuthenticatorSelectionCriteria('platform', 'required', 'required')
);

echo json_encode($publicKeyCredentialCreationOptions);
?>
