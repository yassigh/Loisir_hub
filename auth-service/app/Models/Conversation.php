<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Conversation extends Model {
       use HasFactory;
    protected $fillable = ['type', 'user_id', 'entreprise_id', 'admin_id'];

    public function user() {
        return $this->belongsTo(User::class);
    }
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
    public function entreprise() {
        return $this->belongsTo(Entreprise::class);
    }

    public function messages() {
        return $this->hasMany(Message::class);
    }
}