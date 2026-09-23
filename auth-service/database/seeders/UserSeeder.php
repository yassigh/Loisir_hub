<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Créer un admin
        User::create([
            'first_name' => 'Yassine ',
            'last_name' => 'Mami',
            'email' => 'yassinegh@gmail.com',
            'password' => Hash::make('123456789'),
            'numTelU' => '12345678',
            'role' => 'admin',
            'is_active' => true,
            'email_verified_at' => now()
        ]);

        // Créer quelques utilisateurs normaux
        User::create([
            'first_name' => 'Yassine',
            'last_name' => 'Test',
            'email' => 'aa@gmail.com',
            'password' => Hash::make('123456789'),
            'numTelU' => '98765432',
            'role' => 'user',
            'is_active' => true,
            'email_verified_at' => now()
        ]);

        // Créer 5 utilisateurs aléatoires
        for ($i = 1; $i <= 5; $i++) {
            User::create([
                'first_name' => "User$i",
                'last_name' => "Test$i",
                'email' => "user$i@test.com",
                'password' => Hash::make('password'),
                'numTelU' => "1234567$i",
                'role' => 'user',
                'is_active' => true,
                'email_verified_at' => now()
            ]);
        }
    }
}
