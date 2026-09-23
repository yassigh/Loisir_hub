<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Categorie extends Model
{
    use HasFactory;

    protected $table = 'categories';  // Nom de la table

    protected $primaryKey = 'id';  // Clé primaire

    protected $fillable = [
        'nomCat',
        'descriptionCat',
    ];

    // Si vous voulez désactiver les timestamps :
    // public $timestamps = false;

    // Exemple de relation avec une autre table :
    // public function activites()
    // {
    //     return $this->hasMany(Activite::class, 'category_id', 'idCat');
    // }
    public function activitesPayantes()
    {
        return $this->hasMany(ActivitePayant::class, 'categorie_id');
    }
    public function postes()
{
    return $this->hasMany(Poste::class, 'categorie_id');
}
}
