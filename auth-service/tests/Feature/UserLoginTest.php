<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'yassinegh@gmail.com',
            'password' => Hash::make('123456789'),
        ]);

        $response = $this->postJson('/api/user/login', [
            'email' => 'yassinegh@gmail.com',
            'password' => '123456789',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['user', 'token']);
    }
}