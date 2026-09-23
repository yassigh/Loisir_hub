<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ConversationFactory extends Factory
{
    protected $model = \App\Models\Conversation::class;

    public function definition()
    {
        return [
            'type' => 'user-and-entreprise',
            'user_id' => \App\Models\User::factory(),
            'entreprise_id' => \App\Models\Entreprise::factory(),
            // Ajoute d'autres champs si besoin
        ];
    }
}