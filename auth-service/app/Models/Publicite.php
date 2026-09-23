<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publicite extends Model
{
    use HasFactory;

    protected $fillable = ['date_debut', 'jours', 'prix', 'entreprise_id'];

    protected $casts = [
        'date_debut' => 'date',
    ];

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

    public function images()
    {
        return $this->hasMany(PubliciteImage::class);
    }
}