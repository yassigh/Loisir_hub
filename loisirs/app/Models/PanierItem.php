<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PanierItem extends Model
{
    protected $fillable = ['panier_id', 'reservation_id', 'prix', 'statut'];

    public function panier()
    {
        return $this->belongsTo(Panier::class);
    }

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'reservation_id', 'id_Res');
    }
}
