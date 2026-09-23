<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'entreprise_id',
        'plan_id',
        'start_date',
        'end_date',
        'status',
        'payment_status',
        'amount_paid'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'amount_paid' => 'float'
    ];

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class, 'entreprise_id');
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }
    // Vérifier si l'abonnement est actif
    public function isActive()
    {
        return $this->status === 'active' && $this->end_date->isFuture();
    }

    // Vérifier si l'abonnement est expiré
    public function isExpired()
    {
        return $this->end_date->isPast();
    }

    // Vérifie si le paiement est complété
    public function isPaid()
    {
        return $this->payment_status === 'completed';
    }
    public function payments()
    {
        return $this->hasMany(SubscriptionPayment::class);
    }
}
