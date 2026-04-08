const msalInstance = new msal.PublicClientApplication(CONFIG.auth);

async function login() {
    try {
        const loginResponse = await msalInstance.loginPopup({ scopes: CONFIG.scopes });
        console.log("Sesión iniciada");
        return loginResponse.accessToken;
    } catch (err) {
        console.error("Error en login:", err);
    }
}