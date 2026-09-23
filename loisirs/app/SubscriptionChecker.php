<?php

namespace App;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

trait SubscriptionChecker
{
    protected function checkSubscription($entrepriseId)
    {
        $cacheKey = "subscription_{$entrepriseId}";

        return Cache::remember($cacheKey, 300, function () use ($entrepriseId) {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
            ])->get(env('AUTH_SERVICE_URL') . '/api/subscriptions/current', [
                'entreprise_id' => $entrepriseId
            ]);

            if ($response->successful()) {
                return $response->json()['subscription'] ?? null;
            }

            return null;
        });
    }
}
