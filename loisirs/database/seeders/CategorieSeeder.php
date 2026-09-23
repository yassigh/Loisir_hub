<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Categorie;

class CategorieSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'nomCat' => 'Sport',
                'descriptionCat' => 'Activités sportives',
            ],
            [
                'nomCat' => 'Loisirs',
                'descriptionCat' => 'Activités de loisirs',
            ],
            [
                'nomCat' => 'Culture',
                'descriptionCat' => 'Activités culturelles',
            ],
            [
                'nomCat' => 'Bien-être',
                'descriptionCat' => 'Activités de bien-être',
            ],
        ];

        foreach ($categories as $category) {
            Categorie::create($category);
        }
    }
}
