<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    protected $fillable = [
        'user_id',
        'entreprise_id',
        'reservation_id',
        'publicite_id',
        'montant',
        'statut',
        'transaction_id',
        'methode_paiement',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'reservation_id');
    }
    public function markAsPaid()
    {
        $this->update(['payment_status' => 'payée']);
    }

    public function markAsFailed()
    {
        $this->update(['payment_status' => 'rejected']);
    }
    public function publicite()
    {
        return $this->belongsTo(Publicite::class,'publicite_id');
    }
}
