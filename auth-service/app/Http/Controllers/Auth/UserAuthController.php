<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyEmail;
use Illuminate\Support\Facades\DB;
use App\Models\Desactivation;
use Carbon\Carbon;
use App\Traits\SessionManager;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class UserAuthController extends Controller
{
    use SessionManager;
    /**
     * Enregistrer une user
     */
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'string|max:255',
            'last_name' => 'string|max:255',
            'numTelU' => 'string|max:20',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            // 'imageU' => 'nullable|exists:users,imageU|string' // Accepter un chemin existant
   'imageU' => 'nullable|file|image|mimes:jpg,png,jpeg|max:4096'
        ]);

        $token = Str::random(64); // Génère un token unique
        $userData = [
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'numTelU' => $request->numTelU,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'activation_token' => $token
        ];

        if ($request->hasFile('imageU')) {
            $path = $request->file('imageU')->store('users', 'public');
            $userData['imageU'] = $path;
        }

        $user = User::create($userData);
        Mail::to($user->email)->send(new VerifyEmail($user));

        return response()->json([
            'message' => 'Compte créé avec succès. Vérifiez votre email.',
            'user' => $user,
             'token' => $token,
        ], 201);
    }
    public function verifyEmail($token)
    {
        $user = User::where('activation_token', $token)->first();

        if (!$user) {
            return response()->json(['message' => 'Lien de vérification invalide ou expiré.'], 400);
        }

        // Vérification et mise à jour en force
        $user->email_verified_at = now();
        $user->is_active = true;
        $user->activation_token = null;
        $user->save();

        return response()->json(['message' => 'Email vérifié avec succès !'], 200);
    }
    /** * Connexion user */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les informations d’identification sont incorrectes.'],
            ]);
        }
        if (!$user->is_active) {
            return response()->json(['message' => 'Veuillez vérifier votre email avant de vous connecter.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        $this->createSession($user, $token, $request, 'user');


       return response()->json([
    'user' => $user,
    'token' => $token,
]);
    }




    public function checkUserExists($id)
    {
        $exists = User::where('id', $id)->exists();
        return response()->json(['exists' => $exists]);
    }

    
    public function logout(Request $request)
    {
        // new version de logout
        DB::transaction(function () use ($request) {
            $user = $request->user();
            // Supprimer la session
            DB::table('sessions')->where('user_id', $user->id)->delete();
            // Supprimer les tokens
            $user->tokens()->delete();
        });

        return response()->json(['message' => 'Déconnexion réussie']);
    }

    /**
     * Mettre à jour le profil utilisateur
     */
    public function updateProfile(Request $request)
    {
        try {
            DB::beginTransaction();
            Log::info('Raw request data:', $request->all());

            $user = $request->user();

            $validatedData = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'numTelU' => 'nullable|string|max:20',
               //  'imageU' => 'nullable|exists:users,imageU|string'
                'imageU' => 'nullable|file|image|mimes:jpg,png,jpeg|max:2048'
            ]);

            Log::info('Validated data:', $validatedData);

            foreach ($validatedData as $key => $value) {
                if ($request->has($key)) {
                    $user->$key = $value;
                }
            }
            if ($request->hasFile('imageU')) {
                if ($user->imageU) {
                    Storage::delete('public/' . $user->imageU);
                }
                $path = $request->file('imageU')->store('users', 'public');
                $user->imageU = $path;
            }
            $user->save();
            DB::commit();

            return response()->json([
                'message' => 'Profile updated successfully',
               'user' => $user->fresh(),
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            Log::error('Validation error:', $e->errors());
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error:', ['message' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    //desactiver Profile new version 
    public function desactiverProfile(Request $request)
    {
        DB::transaction(function () use ($request) {
            $user = $request->user();

            // Désactiver le compte
            $user->is_active = false;
            $user->activation_token = Str::random(64);
            $user->save();

            // Créer l'enregistrement de désactivation
            $desactivation = Desactivation::create([
                'user_id' => $user->id,
                'type' => 'user',
                'date_debut' => now(),
                'date_fin' => Carbon::now()->addDays(30),
                'is_deleted' => false,
            ]);

            // Supprimer toutes les sessions actives
            DB::table('sessions')
                ->where('user_id', $user->id)
                ->delete();

            // Supprimer tous les tokens
            $user->tokens()->delete();

            // Envoyer l'email
            Mail::to($user->email)->send(new VerifyEmail($user));

            return $desactivation; // Pour pouvoir l'utiliser dans la réponse
        });

        return response()->json([
            'message' => 'Votre compte utilisateur a été désactivé.',
            'data' => $desactivation ?? null
        ]);
    }
    public function getUserDetails(Request $request)
    {
        // $user = $request->user();
        // $session = DB::table('sessions')
        //     ->where('user_id', $user->id)
        //     ->first();

        // return response()->json([
        //     'user' => $user,
        //     'session_info' => [
        //         'last_activity' => Carbon::createFromTimestamp($session->last_activity),
        //         'ip_address' => $session->ip_address,
        //         'user_agent' => $session->user_agent
        //     ]
        // ]);
        $user = $request->user(); // Récupère l'utilisateur authentifié

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }
    
        return response()->json([
            'user' => $user,
        ]);
    }
    public function getUserById($id)
    {
        try {
            $user = User::select('id', 'first_name', 'last_name', 'email', 'numTelU', 'imageU')
                ->findOrFail($id);
            return response()->json($user);
        } catch (\Exception $e) {
            Log::error('Error fetching user:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'User not found'], 404);
        }
    }

    /**
     * Télécharger une image
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,png,jpeg|max:2048',
        ]);

        $user = $request->user();

        // Supprimer l'ancienne image si elle existe
        if ($user->imageU) {
            Storage::disk('public')->delete($user->imageU);
        }

        // Stocker la nouvelle image
        $path = $request->file('image')->store('users', 'public');
        $user->imageU = $path;
        $user->save();

        return response()->json([
            'message' => 'Image uploaded successfully',
            'path' => $path,
        ]);
    }
}
