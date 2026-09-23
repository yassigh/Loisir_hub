<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Models\ActivitePayant;

class ActivitePayantTest extends TestCase
{
    public function test_create_activite_payant_model()
    {
        $data = [
            'nomActP' => 'Tennis',
            'descriptionP' => 'Cours de tennis',
            'lieuP' => 'Paris',
            'regionP' => 'Ile-de-France',
            'prixP' => '50',
            'offreP' => 'Promo',
            'status' => 'approved',
            'entreprise_id' => 1,
            'categorie_id' => 1,
        ];

        $activite = new ActivitePayant($data);

        $this->assertEquals('Tennis', $activite->nomActP);
        $this->assertEquals('Paris', $activite->lieuP);
        $this->assertEquals('50', $activite->prixP);
        $this->assertEquals('approved', $activite->status);
    }
}