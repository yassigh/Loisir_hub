<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_Res';

    protected $fillable = [
        'id_Act',
        'user_id',
        'dateCreationReservation',
        'dateDebut',
        'dateFin',
        'num_tel',
        'montant',
        'etat',
        'nbPersonnes',
        'description',
        'entreprise_id',
        'payment_status',
        'nombreSeances',
        'heureDebut',    
        'heureFin',      
        'duree'          
    ];

    // Correction de la relation activite vers activitePayant
    public function activitePayant()
    {
        return $this->belongsTo(ActivitePayant::class, 'id_Act', 'idActP');
    }

    public function panier()
    {
        return $this->hasOne(Panier::class, 'id_Res', 'id_Res');
    }
    public function entreprise()
    {
        return $this->belongsTo(ActivitePayant::class, 'entreprise_id', 'entreprise_id');
    }
    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'id_Cat', 'id');
    }
}
