<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favore extends Model {
    use HasFactory;

    protected $fillable = ['user_id', 'entity_id', 'entity_type', 'event_date', 'is_read'];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
