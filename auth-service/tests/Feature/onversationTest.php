<?php


namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Entreprise;
use App\Models\Conversation;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_conversation_with_entreprise()
    {
        $user = User::factory()->create(['role' => 'user', 'is_active' => true]);
        $entreprise = Entreprise::factory()->create();

        $this->actingAs($user);

        $response = $this->postJson('/api/conversations', [
            'entreprise_id' => $entreprise->id,
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['id', 'type', 'user_id', 'entreprise_id']);
    }
}