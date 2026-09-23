<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Publicite extends Model
{
    use HasFactory;

    protected $table = 'publicites';

    protected $fillable = [
        'entreprise_id',
        'date_debut',
        'nbJours',
        'montantAPayer',
        'montantAPayerParJour',
        'statut',
        'payment_status'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'nbJours' => 'integer',
        'montantAPayer' => 'decimal:2',
        'montantAPayerParJour' => 'decimal:2'
    ];

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }
    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class, 'entreprise_id');
    }
}
