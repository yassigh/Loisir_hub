<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use App\Traits\SessionManager;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Exception;
use Illuminate\Http\Request;

class GoogleAuthController extends Controller

//v2.0
{ use SessionManager;
    public function redirectToGoogle()
    {
        try {
            return Socialite::driver('google')
                ->stateless()
                ->with(['prompt' => 'select_account'])
                ->redirect();
        } catch (Exception $e) {
            Log::error('Google redirect error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    //v3.0
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::updateOrCreate([
                'email' => $googleUser->email,
            ], [
                'first_name' => $googleUser->name,
                'last_name' => '',
                'email_verified_at' => now(),
                'password' => bcrypt(Str::random(24)),
                'role' => 'user',
                'is_active' => true,
                'imageU' => $googleUser->avatar
            ]);

            $token = $user->createToken('google-token')->plainTextToken;

            // Vérifier si la requête vient de l'app mobile
            $userAgent = $request->header('User-Agent');
            $isMobile = strpos($userAgent, 'ReactNative') !== false;

            if ($isMobile) {
                return view('auth.google-callback', ['token' => $token]);
            }

            // Pour le web
            return redirect(env('FRONTEND_URL') . '/auth/callback?token=' . $token);
        } catch (Exception $e) {
            Log::error('Google callback error: ' . $e->getMessage());
            return view('auth.google-error', ['error' => $e->getMessage()]);
        }
    }
    //v3.0
    public function handleMobileGoogleAuth(Request $request)
    {
        try {
            $idToken = $request->input('idToken');
        $fullName = $request->input('name');
        $email = $request->input('email');
        $photo = $request->input('photo');

        // Séparation du nom
        $nameParts = explode(' ', $fullName);
        $firstName = $nameParts[0];
        $lastName = count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : $firstName;


            $user = User::updateOrCreate([
                'email' => $email
            ], [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email_verified_at' => now(),
                'imageU' => $photo,
                'is_active' => true,
                'password' => bcrypt(Str::random(24))
            ]);

            $token = $user->createToken('google-token')->plainTextToken;
$this->createSession($user, $token, $request, 'user');
            return response()->json([
                'token' => $token,
                'user' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Google Auth Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    //v2.0 marche correctement 
    //     public function handleMobileGoogleAuth(Request $request)
    // {
    //     try {
    //         $idToken = $request->input('idToken');
    //         $fullName = $request->input('name');
    //         $email = $request->input('email');
    //         $photo = $request->input('photo');

    //         // Séparer le nom complet en prénom et nom
    //         $nameParts = explode(' ', $fullName);
    //         $firstName = $nameParts[0];
    //         $lastName = isset($nameParts[1]) ? $nameParts[1] : ''; // Si pas de nom, chaîne vide

    //         $user = User::updateOrCreate([
    //             'email' => $email
    //         ], [
    //             'first_name' => $firstName,
    //             'last_name' => $lastName, // Ajout du last_name
    //             'email_verified_at' => now(),
    //             'imageU' => $photo,
    //             'is_active' => true,
    //             'password' => bcrypt(Str::random(24))
    //         ]);

    //         $token = $user->createToken('google-token')->plainTextToken;

    //         return response()->json([
    //             'token' => $token,
    //             'user' => $user
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Google Auth Error:', [
    //             'message' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);
    //         return response()->json(['error' => $e->getMessage()], 500);
    //     }
    // }
    //v1.0
    //     public function handleMobileGoogleAuth(Request $request)
    // {
    //     try {
    //         $idToken = $request->input('idToken');
    //         $email = $request->input('email');
    //         $name = $request->input('name');
    //         $photo = $request->input('photo');

    //         $user = User::updateOrCreate([
    //             'email' => $email
    //         ], [
    //             'first_name' => $name,
    //             'email_verified_at' => now(),
    //             'imageU' => $photo,
    //             'is_active' => true,
    //             'password' => bcrypt(Str::random(24))
    //         ]);

    //         $token = $user->createToken('google-token')->plainTextToken;

    //         return response()->json([
    //             'token' => $token,
    //             'user' => $user
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => $e->getMessage()], 500);
    //     }
    // }
    //v2.0 marche correctement
    // public function handleGoogleCallback()
    // {
    //     try {
    //         $googleUser = Socialite::driver('google')->stateless()->user();

    //         $user = User::updateOrCreate([
    //             'email' => $googleUser->email,
    //         ], [
    //             'first_name' => $googleUser->name,
    //             'last_name' => '',
    //             'email_verified_at' => now(),
    //             'password' => bcrypt(Str::random(24)),
    //             'role' => 'user',
    //             'is_active' => true,
    //             'imageU' => $googleUser->avatar
    //         ]);

    //         $token = $user->createToken('google-token')->plainTextToken;

    //         // Retourner la vue avec le token
    //         return view('auth.google-callback', ['token' => $token]);
    //     } catch (Exception $e) {
    //         Log::error('Google callback error: ' . $e->getMessage());
    //         return view('auth.google-error', ['error' => $e->getMessage()]);
    //     }
    // }
    //v1.0
    // public function handleGoogleCallback()
    // {
    //     try {
    //         $googleUser = Socialite::driver('google')->stateless()->user();

    //         $user = User::updateOrCreate([
    //             'email' => $googleUser->email,
    //         ], [
    //             'first_name' => $googleUser->name,
    //             'last_name' => '',
    //             'email_verified_at' => now(),
    //             'password' => bcrypt(Str::random(24)),
    //             'role' => 'user',
    //             'is_active' => true,
    //             'imageU' => $googleUser->avatar
    //         ]);

    //         $token = $user->createToken('google-token')->plainTextToken;

    //         return redirect(env('FRONTEND_URL') . '/auth/callback?token=' . $token);

    //     } catch (Exception $e) {
    //         Log::error('Google callback error: ' . $e->getMessage());
    //         return redirect(env('FRONTEND_URL') . '/auth/error');
    //     }
    // }
}
