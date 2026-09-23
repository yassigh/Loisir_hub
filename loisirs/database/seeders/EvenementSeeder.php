<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Evenement;


class EvenementSeeder extends Seeder
{
    public function run(): void
    {
        $evenements = [
            [
                'nomEvent' => 'Tournoi de Football',
                'descriptionEvent' => 'Tournoi amateur 5vs5',
                'lieuEvent' => 'SportCenter',
                'regionEvent' => 'Tunis',
                'typeEvent' => 'Sport',
                'date_debutEvent' => '2024-05-01 09:00:00',
                'date_finEvent' => '2024-05-01 18:00:00',
                'categorie_id' => 1,
                'status' => 'approved',
                'entreprise_id' => '1'
            ],
            [
                'nomEvent' => 'Marathon Fitness',
                'descriptionEvent' => 'Session fitness intensive',
                'lieuEvent' => 'Fitness Club',
                'regionEvent' => 'Sousse',
                'typeEvent' => 'Sport',
                'date_debutEvent' => '2024-05-15 14:00:00',
                'date_finEvent' => '2024-05-15 20:00:00',
                'categorie_id' => 4,
                'status' => 'approved',
                'entreprise_id' => '2'
            ],
        ];

        foreach ($evenements as $evenement) {
            Evenement::create($evenement);
        }
    }
}
