<?php
// app/Traits/SessionManager.php

namespace App\Traits;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

trait SessionManager
{
    protected function createSession($user, $token, $request, $userType)
    {
        // Nettoyer les anciennes sessions
        $this->cleanOldSessions($user->id);

        return DB::table('sessions')->insert([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'user_type' => $userType,
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
            'payload' => json_encode([
                'auth_token' => $token,
                'created_at' => now()
            ]),
            'last_activity' => now()->timestamp
        ]);
    }

    protected function cleanOldSessions($userId)
    {
        DB::table('sessions')
            ->where('user_id', $userId)
            ->where('last_activity', '<', now()->subDays(7)->timestamp)
            ->delete();
    }
}
