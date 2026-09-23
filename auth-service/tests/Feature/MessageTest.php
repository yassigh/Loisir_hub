<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Entreprise;
use App\Models\Conversation;
use App\Models\Message;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_send_message_to_entreprise()
    {
        $user = User::factory()->create(['role' => 'user', 'is_active' => true]);
        $entreprise = Entreprise::factory()->create();
        $conversation = Conversation::factory()->create([
            'user_id' => $user->id,
            'entreprise_id' => $entreprise->id,
            'type' => 'user-and-entreprise'
        ]);

        $this->actingAs($user);

        $response = $this->postJson('/api/messages', [
            'conversation_id' => $conversation->id,
            'content' => 'Bonjour entreprise !',
            'receiver_id' => $entreprise->id,
            'receiver_type' => 'entreprise'
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['id', 'conversation_id', 'content', 'sender_id', 'sender_type']);
    }
}