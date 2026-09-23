<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;

class Commentaire extends Model
{
    use HasFactory;

    protected $fillable = ['contenu', 'user_id', 'entreprise_id', 'element_id', 'element_type'];

    public function auteur()
    {
        return $this->belongsTo(User::class, 'user_id'); 
    }

    public function element()
    {
        return $this->morphTo();
    }

    
}
