<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsUserMiddleware
{
    // public function handle(Request $request, Closure $next)
    // {
    //     $userData = $request->get('user_data');

    //     if ($userData && isset($userData['user']) && $userData['user']['role'] === 'user') {
    //         return $next($request);
    //     }

    //     return response()->json(['message' => 'Accès non autorisé'], 403);
    // }
    public function handle(Request $request, Closure $next)
    {
        $userData = $request->get('user_data');

        if (
            $userData &&
            isset($userData['user']) &&
            $userData['user']['type'] === 'user'
        ) {
            return $next($request);
        }

        return response()->json(['message' => 'Accès non autorisé'], 403);
    }
}
