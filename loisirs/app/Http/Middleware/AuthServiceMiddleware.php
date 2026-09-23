<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuthServiceMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->bearerToken()) {
            return response()->json(['message' => 'Non autorisé'], 401);
        }
    
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $request->bearerToken()
            ])->get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/validate-token');
    
            if ($response->successful()) {
                $userData = $response->json();
                Log::debug('Auth Service Response:', $userData);
                
                // Vérifie si les données utilisateur sont valides
                if (!isset($userData['user']) || !isset($userData['user']['id'])) {
                    return response()->json(['message' => 'Données utilisateur invalides'], 401);
                }
                
                $request->merge(['user_data' => $userData]);
                return $next($request);
            }
    
            return response()->json(['message' => 'Token invalide'], 401);
        } catch (\Exception $e) {
            Log::error('Auth Service Error:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur de service d\'authentification'], 500);
        }
    }
}