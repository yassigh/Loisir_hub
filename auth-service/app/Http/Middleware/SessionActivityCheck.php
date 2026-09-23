<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;

class SessionActivityCheck
{
    public function handle($request, Closure $next)
    {
        $user = $request->user();

        $session = DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('last_activity', '>', now()->subHours(24)->timestamp)
            ->first();

        if (!$session) {
            return response()->json(['message' => 'Session expirée'], 401);
        }

        // Mettre à jour last_activity
        DB::table('sessions')
            ->where('user_id', $user->id)
            ->update(['last_activity' => now()->timestamp]);

        return $next($request);
    }
}
