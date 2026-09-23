<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Http;


class ActivitePayant extends Model
{
    use HasFactory;

    protected $table = 'activite_payants';

    protected $primaryKey = 'idActP';

    protected $fillable = [
        'nomActP',
        'descriptionP',
        'lieuP',
        'regionP',
        'prixP',
        'heure', 
        'minute',
        'jours',
        'status',
        'offreP',
        'categorie_id',
        'entreprise_id'
    ];
    public function commentaires()
    {
        return $this->morphMany(Commentaire::class, 'element');
    }
    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'categorie_id');
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
    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'id_Act', 'idActP');
    }
}
