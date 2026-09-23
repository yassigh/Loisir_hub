<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ActivitePayantFactory extends Factory
{
    protected $model = \App\Models\ActivitePayant::class;

    public function definition()
    {
        return [
            'nomActP' => $this->faker->sentence(2),
            'descriptionP' => $this->faker->paragraph,
            'lieuP' => $this->faker->city,
            'regionP' => $this->faker->city,
            'prixP' => $this->faker->randomFloat(2, 10, 100),
             'heure' => $this->faker->numberBetween(0, 23), // <-- si c'est un int
        'minute' => $this->faker->numberBetween(0, 59),
           'jours' => $this->faker->numberBetween(1, 7),
            'offreP' => null,
            'status' => 'approved',
            'entreprise_id' => 1,
            'categorie_id' => 1,
        ];
    }
}