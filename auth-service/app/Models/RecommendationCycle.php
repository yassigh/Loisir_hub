<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecommendationCycle extends Model
{
    protected $fillable = ['last_type', 'last_sent_at', 'sent_recommendations'];
    protected $dates = ['last_sent_at'];
    protected $casts = [
        'sent_recommendations' => 'array'
    ];
}
