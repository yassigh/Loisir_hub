<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PublicStorageAccess
{
    public function handle($request, Closure $next)
    {
        // header('Access-Control-Allow-Origin: *');
        // header('Access-Control-Allow-Methods: GET');
        // header('Access-Control-Allow-Headers: *');
        // Ajoutez les types MIME corrects
        $headers = [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET',
            'Access-Control-Allow-Headers' => '*',
            'Content-Type' => $this->getMimeType($request->path())
        ];

        return $next($request)->withHeaders($headers);
    }

    private function getMimeType($path)
    {
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png'
        ];
        return $mimeTypes[$extension] ?? 'application/octet-stream';
    }
}