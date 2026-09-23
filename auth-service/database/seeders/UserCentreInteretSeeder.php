<?php


namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\CentreDInteret;

class UserCentreInteretSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        $centres = CentreDInteret::pluck('id')->toArray();

        // Associe tous les centres d'intérêt au premier utilisateur
        if ($user && count($centres)) {
            $user->centresInteret()->sync($centres);
        }
    }
}