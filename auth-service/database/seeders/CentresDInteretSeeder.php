<?php


namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CentreDInteret;

class CentresDInteretSeeder extends Seeder
{
    public function run(): void
    {
        $centres = [
            [
                'nom' => 'Sport',
                'description' => 'Toutes les activités sportives',
            ],
            [
                'nom' => 'Musique',
                'description' => 'Instruments, chant, groupes...',
            ],
            [
                'nom' => 'Lecture',
                'description' => 'Livres, BD, romans...',
            ],
        ];

        foreach ($centres as $centre) {
            CentreDInteret::create($centre);
        }
    }
}