<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Panier extends Model
{
    protected $fillable = ['user_id', 'total_amount'];

    public function items()
    {
        return $this->hasMany(PanierItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
