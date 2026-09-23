<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class ForgotPasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_request_password_reset()
    {
        $user = User::factory()->create([
            'email' => 'resetuser@example.com',
        ]);

        $response = $this->postJson('/api/user/forgot-password', [
            'email' => 'resetuser@example.com',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => true]);
    }
}