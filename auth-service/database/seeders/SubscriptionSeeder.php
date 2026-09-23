<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subscription;
use App\Models\Entreprise;
use App\Models\SubscriptionPlan;
use Carbon\Carbon;

class SubscriptionSeeder extends Seeder
{
    public function run(): void
    {
        $entreprise = Entreprise::first();
        $plan = SubscriptionPlan::first();

        Subscription::create([
            'entreprise_id' => $entreprise->id,
            'plan_id' => $plan->id,
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays($plan->duration_in_days),
            'status' => 'active',
            'payment_status' => 'completed',
            'amount_paid' => $plan->price,
        ]);
    }
}