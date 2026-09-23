<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class EvenementFactory extends Factory
{
    protected $model = \App\Models\Evenement::class;

    public function definition()
    {
        return [
           'nomEvent' => $this->faker->sentence(2),
        'descriptionEvent' => $this->faker->paragraph,
        'typeEvent' => $this->faker->word, // <-- Ajoute ceci
        'date_debutEvent' => $this->faker->date(),
        'date_finEvent' => $this->faker->date(),
        'lieuEvent' => $this->faker->city,
        'regionEvent' => $this->faker->city,
        'status' => 'approved',
        'entreprise_id' => 1,
        'categorie_id' => 1,
        ];
    }
}