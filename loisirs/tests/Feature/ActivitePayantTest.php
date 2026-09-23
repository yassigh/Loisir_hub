<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Categorie;
class ActivitePayantTest extends TestCase
{
    use RefreshDatabase;
public function setUp(): void
{
    parent::setUp();
    Categorie::factory()->create(['id' => 1, 'nomCat' => 'Test', 'descriptionCat' => 'Catégorie test']);
}
    public function test_can_create_activite_payant()
    {  $this->withoutMiddleware(); // Désactive l'auth pour ce test

       $response = $this->postJson('/api/activites-payantes', [
      'nomActP' => 'Tennis',
    'descriptionP' => 'Cours de tennis',
    'lieuP' => 'Paris',
    'regionP' => 'Ile-de-France',
    'prixP' => '50',
    'heure' => 10,
    'minute' => 0,
    'jours' => 3,
    'offreP' => 'Promo',
    'status' => 'approved',
    'categorie_id' => 1,
    // Simule un user connecté entreprise
    'user_data' => [
        'user' => [
            'id' => 1
        ]
    ]
    ]);
    $response->assertStatus(201)
             ->assertJsonFragment(['nomActP' => 'Tennis']);
}
}