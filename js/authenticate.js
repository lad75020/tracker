async function authenticate() {
    const response = await fetch('https://tracker.dubertrand.fr/generate_authentication_options.php');
    const options = await response.json();

    options.challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));

    const credential = await navigator.credentials.get({ publicKey: options });

    const credentialData = {
        id: credential.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        type: credential.type,
        response: {
            authenticatorData: btoa(String.fromCharCode(...new Uint8Array(credential.response.authenticatorData))),
            clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
            signature: btoa(String.fromCharCode(...new Uint8Array(credential.response.signature))),
            userHandle: btoa(String.fromCharCode(...new Uint8Array(credential.response.userHandle)))
        }
    };

    const authResponse = await fetch('https://tracker.dubertrand.fr/verify_credential.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentialData)
    });

    const result = await authResponse.json();
    if (result.success) {
        alert('Authentication successful!');
    } else {
        alert('Authentication failed: ' + result.message);
    }
}
