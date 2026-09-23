<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ReservationFactory extends Factory
{
    protected $model = \App\Models\Reservation::class;

    public function definition()
    {
        return [
            'id_Act' => 1, // ou la clé étrangère correcte vers ActivitePayant
            'etat' => 'accepte',
            // Ajoute ici les autres champs requis par ta migration
        ];
    }
}