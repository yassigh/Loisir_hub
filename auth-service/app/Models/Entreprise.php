<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Subscription;  // Ajouter cet import


class Entreprise extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'nomE',
        'email',
        'password',
        'matriculeE',
        'lien_facebook_E',
        'logoE',
        'lien_site_E',
        'villeE',
        'adresseE',
        'email_verified_at',
        'reset_code',
        'activation_token',
        'is_active',
        'flouci_public_key',
        'flouci_secret_key', 
        'flouci_developer_id'

    ];

    protected $hidden = [
        'password',
        'flouci_secret_key' 
    ];

    protected $encryptable = [
        'flouci_public_key',
        'flouci_secret_key',
        'flouci_developer_id'
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function setLogoAttribute($value)
    {
        if ($value && is_file($value)) {
            $path = $value->store('entreprises', 'public');
            $this->attributes['logoE'] = $path;
        }
    }

     /**
     * Get all subscriptions for the entreprise
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'entreprise_id');
    }

    /**
     * Get current active subscription
     */
    public function currentSubscription()
    {
        return $this->hasOne(Subscription::class, 'entreprise_id')
            ->where('status', 'active')
            ->where('end_date', '>', now())
            ->latest();
    }
}
