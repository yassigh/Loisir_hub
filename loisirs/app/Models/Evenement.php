<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Http;

class Evenement extends Model
{
    use HasFactory;

    protected $table = 'evenements'; // Nom de la table

    protected $fillable = [
        'nomEvent',
        'descriptionEvent',
        'lieuEvent',
        'regionEvent',
        'typeEvent',
        'status',
        'date_debutEvent',
        'date_finEvent',
        'categorie_id',
        'entreprise_id'
    ];

    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }

    public function images()
    {
        return $this->morphMany(Image::class, 'imageable');
    }
    public function entreprise()
{
    $entrepriseId = $this->entreprise_id;

    // Appeler l'API pour récupérer les données de l'entreprise
    $response = Http::get(env('AUTH_SERVICE_URL') . '/api/entreprise/entreprises/' . $entrepriseId);

    if ($response->successful()) {
        return $response->json();
    }

    return null; // Retourner null si l'API échoue
}
}
