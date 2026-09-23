<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Entreprise;
use Illuminate\Support\Facades\Hash;

class EntrepriseSeeder extends Seeder
{
    public function run(): void
    {
        // Créer quelques entreprises
        $entreprises = [
            [
                'nomE' => 'Sport Center',
                'email' => 'yassinegharb1JXF@gmail.com',
                'password' => Hash::make('123456789'),
                'matriculeE' => 'MAT001',
                'villeE' => 'Tunis',
                'adresseE' => '123 Rue Sport',
                'lien_facebook_E' => 'https://facebook.com/sportcenter',
                'lien_site_E' => 'https://sportcenter.com',
                'is_active' => true,
                'email_verified_at' => now()
            ],
            [
                'nomE' => 'Fitness Club',
                'email' => 'yy@club.com',
                'password' => Hash::make('password'),
                'matriculeE' => 'MAT002',
                'villeE' => 'Sousse',
                'adresseE' => '456 Rue Fitness',
                'lien_facebook_E' => 'https://facebook.com/fitnessclub',
                'lien_site_E' => 'https://fitnessclub.com',
                'is_active' => true,
                'email_verified_at' => now()
            ],
            [
                'nomE' => 'Tennis Academy',
                'email' => 'tennis@academy.com',
                'password' => Hash::make('password'),
                'matriculeE' => 'MAT003',
                'villeE' => 'Sfax',
                'adresseE' => '789 Rue Tennis',
                'lien_facebook_E' => 'https://facebook.com/tennisacademy',
                'lien_site_E' => 'https://tennisacademy.com',
                'is_active' => true,
                'email_verified_at' => now()
            ]
        ];

        foreach ($entreprises as $entreprise) {
            Entreprise::create($entreprise);
        }
    }
}
