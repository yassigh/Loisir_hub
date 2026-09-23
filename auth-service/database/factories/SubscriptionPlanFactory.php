<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SubscriptionPlanFactory extends Factory
{
    protected $model = \App\Models\SubscriptionPlan::class;

    public function definition()
    {
        return [
            'name' => $this->faker->word,
        'description' => $this->faker->sentence,
        'price' => $this->faker->randomFloat(2, 10, 100),
        'duration' => $this->faker->numberBetween(1, 12), 
      'duration_in_days' => $this->faker->numberBetween(30, 365), 
        ];
    }
}