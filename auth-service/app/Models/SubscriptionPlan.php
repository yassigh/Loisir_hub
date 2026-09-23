<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Subscription;


class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'duration_in_days',
        'activities_limit',
        'events_limit',
        'posts_limit',
        'ads_allowed'
    ];

    protected $casts = [
        'price' => 'float',
        'duration_in_days' => 'integer',
        'activities_limit' => 'integer',
        'events_limit' => 'integer',
        'posts_limit' => 'integer',
        'ads_allowed' => 'boolean'
    ];

    // Relation avec les subscriptions
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }

    // Relation avec les entreprises à travers les subscriptions
    public function entreprises()
    {
        return $this->hasManyThrough(Entreprise::class, Subscription::class);
    }
}
