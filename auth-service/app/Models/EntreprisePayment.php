<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class EntreprisePayment extends Model
{
    use HasFactory;

    protected $table = 'entreprise_payments';

    protected $fillable = [
        'entreprise_id',
        'subscription_id',
        'publicite_id',
        'montant',
        'statut',
        'transaction_id',
        'methode_paiement',
        'type_paiement'
    ];

    // Relations
    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }
    public function publicite()
    {
        return $this->belongsTo(Publicite::class,'publicite_id');
    }
}
