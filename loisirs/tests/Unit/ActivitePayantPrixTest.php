<?php


namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Models\ActivitePayant;

class ActivitePayantPrixTest extends TestCase
{
    public function test_prix_is_string()
    {
        $activite = new ActivitePayant([
            'prixP' => 100
        ]);
        // Vérifie que le prix peut être casté en string
        $this->assertIsNotString($activite->prixP);
        $activite->prixP = (string) $activite->prixP;
        $this->assertIsString($activite->prixP);
    }

    public function test_prix_accepts_string()
    {
        $activite = new ActivitePayant([
            'prixP' => '150'
        ]);
        $this->assertIsString($activite->prixP);
        $this->assertEquals('150', $activite->prixP);
    }
}