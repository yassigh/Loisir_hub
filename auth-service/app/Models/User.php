<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable,HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'numTelU',
        'role',
        'imageU',
        'email_verified_at',
        'reset_code',
        'activation_token', 
        'is_active'

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => 'string',
        ];
    }
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isUser(): bool
    {
        return $this->role === 'user';
    }
    public function setImageAttribute($value) {
        if ($value && is_file($value)) {
            $path = $value->store('users', 'public');
            $this->attributes['imageU'] = $path;
        }
    }
 
    public function getImageUrlAttribute()
    {
        return $this->imageU ? asset('storage/' . $this->imageU) : null;
    }
    public function routeNotificationForMail()
    {
        return $this->email;
    }
    public function centresInteret()
{
    return $this->belongsToMany(CentreDInteret::class, 'user_centre_interet');
}

public function getImageUAttribute($value)
{
    return $value ? asset('storage/' . $value) : null;
}

}
