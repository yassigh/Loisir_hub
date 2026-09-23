<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // $userData = $request->get('user_data');

        // if (
        //     $userData &&
        //     isset($userData['user']) &&
        //     $userData['user']['type'] === 'admin'&&$user && $user->role === 'admin'
        // ) {
        //     return $next($request);
        // }
        $user = $request->user(); // Récupère l'utilisateur connecté

        if ($user && $user->role === 'admin') { // Vérifie si l'utilisateur est un admin
            return $next($request);
        }
        return response()->json(['message' => 'Accès non autorisé'], 403);
    }
}
