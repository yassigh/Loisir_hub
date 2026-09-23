<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class IsEntrepriseMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $userData = $request->get('user_data');

        if (
            $userData &&
            isset($userData['user']) &&
            $userData['user']['type'] === 'entreprise'
        ) {
            return $next($request);
        }

        return response()->json(['message' => 'Accès non autorisé'], 403);
    }
}
