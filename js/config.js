const CONFIG = {
    auth: {
        clientId: "AQUI-EL-ID-DE-AZURE", // IT completará esto
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin
    },
    scopes: ["Files.Read.All", "User.Read"]
};