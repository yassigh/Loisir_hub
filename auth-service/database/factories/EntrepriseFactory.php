<?php


namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class EntrepriseFactory extends Factory
{
    protected $model = \App\Models\Entreprise::class;

    public function definition()
    {
        return [
            'nomE' => $this->faker->company,
            'email' => $this->faker->unique()->safeEmail,
            'password' => bcrypt('password'),
            'matriculeE' => strtoupper(Str::random(8)),
            'villeE' => $this->faker->city,
            'adresseE' => $this->faker->address,
            'lien_facebook_E' => $this->faker->url,
            'lien_site_E' => $this->faker->url,
            'is_active' => true,
            'email_verified_at' => now(),
        ];
    }
}