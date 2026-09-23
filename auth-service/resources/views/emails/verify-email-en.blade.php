<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Vérification de votre adresse email</title>
</head>
<body>
    <p>Bonjour {{ $entreprise->name }},</p>
    <p>Merci de vous être inscrit. Veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
    <p>
        <a href="{{ $activationUrl }}" style="color: blue; text-decoration: underline;">
            Vérifier mon adresse email
        </a>
    </p>
    <p>Si vous n'avez pas demandé cette inscription, ignorez cet email.</p>
</body>
</html>
