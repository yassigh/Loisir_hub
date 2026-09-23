<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Plan Free',
                'description' => 'Plan gratuit avec fonctionnalités limitées',
                'price' => 0.00,
                'duration_in_days' => 36500,
                'activities_limit' => 0,
                'events_limit' => 1,
                'posts_limit' => 0,
                'ads_allowed' => false,
            ],
            [
                'name' => 'Plan Standard',
                'description' => 'Plan standard pour les petites entreprises',
                'price' => 49.99,
                'duration_in_days' => 30,
                'activities_limit' => 1,
                'events_limit' => 2,
                'posts_limit' => 2,
                'ads_allowed' => false,
            ],
            [
                'name' => 'Plan Premium',
                'description' => 'Plan premium avec fonctionnalités illimitées',
                'price' => 99.99,
                'duration_in_days' => 30,
                'activities_limit' => 6,
                'events_limit' => 3,
                'posts_limit' => 3,
                'ads_allowed' => true,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::create($plan);
        }
    }
}