<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Poste;


class PosteSeeder extends Seeder
{
    
    public function run(): void
    {
        $postes = [
            [
                'nomPoste' => 'Coach sportif disponible',
                'descriptionPoste' => 'Coach certifié disponible pour séances privées',
                'lieuPoste' => 'Tunis',
                'regionPoste' => 'Tunis',
                'typePoste' => 'Service',
                'categorie_id' => 1,
                'status' => 'approved',
                'entreprise_id' => '1'
            ],
            [
                'nomPoste' => 'Cours de yoga',
                'descriptionPoste' => 'Séances de yoga tous niveaux',
                'lieuPoste' => 'Sousse',
                'regionPoste' => 'Sousse',
                'typePoste' => 'Service',
                'categorie_id' => 4,
                'status' => 'approved',
                'entreprise_id' => '2'
            ],
        ];

        foreach ($postes as $poste) {
            Poste::create($poste);
        }
    }
}
