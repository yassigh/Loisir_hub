<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EntreprisePaiementConfig>
 */
class EntreprisePaiementConfigFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
         return [
        'entreprise_id' => 1,
        'provider' => 'stripe',
        'api_key' => 'test_key',
        // Ajoute ici tous les autres champs obligatoires de ta table
    ];
    }
}
