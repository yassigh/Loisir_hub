<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CentreDInteret extends Model
{
    use HasFactory;

    protected $table = 'centres_d_interet';

    protected $fillable = ['nom', 'description', 'image'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_centre_interet');
    }
    public function getImageUrlAttribute()
{
    return $this->image ? asset('storage/' . $this->image) : null;
}
}
