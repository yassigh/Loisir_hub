<?php
namespace App\Services;

use App\Models\Desactivation;
use Carbon\Carbon;

class DesactivationService
{
    public function desactiver($id, $type)
    {
        $desactivation = Desactivation::create([
            $type === 'user' ? 'user_id' : 'entreprise_id' => $id,
            'type' => $type,
            'date_debut' => now(),
            'date_fin' => Carbon::now()->addDays(30),
            'is_deleted' => false,
        ]);

        return $desactivation;
    }
}
