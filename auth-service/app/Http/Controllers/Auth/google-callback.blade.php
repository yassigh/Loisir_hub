<!DOCTYPE html>
<html>
<head>
    <title>Google Auth Callback</title>
    <script type="text/javascript">
        window.token = '{{ $token }}';
    </script>
</head>
<body>
    <div style="text-align: center; margin-top: 50px;">
        <h2>Authentication réussie!</h2>
        <p>Token: {{ $token }}</p>
    </div>
</body>
</html>