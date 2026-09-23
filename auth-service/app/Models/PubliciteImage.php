<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PubliciteImage extends Model
{
    protected $fillable = ['publicite_id', 'image_path'];

    protected $appends = ['url'];

    public function publicite()
    {
        return $this->belongsTo(Publicite::class);
    }

    public function getUrlAttribute()
    {
        return asset('storage/' . $this->image_path);
    }
}