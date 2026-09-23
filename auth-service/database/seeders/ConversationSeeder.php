<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Conversation;
use App\Models\User;
use App\Models\Entreprise;

class ConversationSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        $entreprise = \App\Models\Entreprise::first();

        Conversation::create([
            'type' => 'user-and-entreprise',
            'user_id' => $user->id,
            'entreprise_id' => $entreprise->id,
        ]);
    }
}