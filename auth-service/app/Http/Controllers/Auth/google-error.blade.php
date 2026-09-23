<!DOCTYPE html>
<html>
<head>
    <title>Google Auth Error</title>
</head>
<body>
    <div style="text-align: center; margin-top: 50px;">
        <h2>Erreur d'authentification</h2>
        <p>{{ $error ?? 'Une erreur est survenue' }}</p>
        <a href="/login">Retour à la page de connexion</a>
    </div>
</body>
</html>