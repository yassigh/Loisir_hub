<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ActivitePayant;

class ActivitePayantSeeder extends Seeder
{
    public function run(): void
    {
        $activites = [
            [
                'nomActP' => 'Football',
                'descriptionP' => 'Match de football 5vs5',
                'lieuP' => 'Terrain SportCenter',
                'regionP' => 'Tunis',
                'prixP' => '40',
                'offreP' => '35 pour les groupes',
                'categorie_id' => 1,
                'status' => 'approved',
                'entreprise_id' => '1'
            ],
            [
                'nomActP' => 'Fitness',
                'descriptionP' => 'Séance de fitness',
                'lieuP' => 'Salle Fitness Club',
                'regionP' => 'Sousse',
                'prixP' => '30',
                'offreP' => '25 pour abonnement mensuel',
                'categorie_id' => 4,
                'status' => 'approved',
                'entreprise_id' => '2'
            ],
        ];

        foreach ($activites as $activite) {
            ActivitePayant::create($activite);
        }
    }
}
