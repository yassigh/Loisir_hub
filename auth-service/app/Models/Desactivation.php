<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Desactivation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'entreprise_id',
        'type',
        'date_debut',
        'date_fin',
        'is_deleted',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }
}
