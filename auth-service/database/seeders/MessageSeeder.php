<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Message;
use App\Models\Conversation;
use App\Models\User;

class MessageSeeder extends Seeder
{
    public function run(): void
    {
        $conversation = Conversation::first();
        $user = \App\Models\User::first();

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'sender_type' => 'user',
            'content' => 'Bonjour, ceci est un message de test.',
        ]);
    }
}
