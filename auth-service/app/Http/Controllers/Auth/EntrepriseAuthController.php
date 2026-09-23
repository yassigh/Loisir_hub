<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Entreprise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyEmailEn;
use Illuminate\Support\Facades\DB;
use App\Services\DesactivationService;
use Carbon\Carbon;
use App\Models\Desactivation;
use Illuminate\Support\Facades\Auth;
use App\Traits\SessionManager;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class EntrepriseAuthController extends Controller
{
    use SessionManager;
     public function index()
    {
        $entreprises = Entreprise::all(['id', 'nomE', 'logoE']);
        return response()->json(['entreprises' => $entreprises]);
    }
    /**
     * Enregistrer une entreprise
     */
    public function register(Request $request)
    {
        $request->validate([
            'nomE' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:entreprises',
            'password' => 'required|string|min:8|confirmed',
            'matriculeE' => 'required|string|unique:entreprises',
            'villeE' => 'required|string',
            'adresseE' => 'required|string',
            'logoE' => 'nullable|string|exists:entreprises,logoE|image|mimes:jpg,png,jpeg|max:4096',
            // Ajouter validation optionnelle pour Flouci
            'flouci_public_key' => 'nullable|string',
            'flouci_secret_key' => 'nullable|string',
            'flouci_developer_id' => 'nullable|string',
        ]);

        $token = Str::random(64); // Génère un token unique

        $entrepriseData = [
            'nomE' => $request->nomE,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'matriculeE' => $request->matriculeE,
            'villeE' => $request->villeE,
            'adresseE' => $request->adresseE,
            'activation_token' => $token
        ];

        // Ajouter les credentials Flouci s'ils sont fournis
        if ($request->filled('flouci_public_key')) {
            $entrepriseData['flouci_public_key'] = encrypt($request->flouci_public_key);
        }
        if ($request->filled('flouci_secret_key')) {
            $entrepriseData['flouci_secret_key'] = encrypt($request->flouci_secret_key);
        }
        if ($request->filled('flouci_developer_id')) {
            $entrepriseData['flouci_developer_id'] = encrypt($request->flouci_developer_id);
        }

        if ($request->hasFile('logoE')) {
            $path = $request->file('logoE')->store('entreprises', 'public');
            $entrepriseData['logoE'] = $path;
        }

        $entreprise = Entreprise::create($entrepriseData);
        Mail::to($entreprise->email)->send(new VerifyEmailEn($entreprise));

        return response()->json([
            'message' => 'Compte créé avec succès. Vérifiez votre email.',
            'entreprise' => $entreprise
        ], 201);
    }

    public function verifyEmail($token)
    {
        $entreprise = Entreprise::where('activation_token', $token)->first();

        if (!$entreprise) {
            return response()->json(['message' => 'Lien de vérification invalide ou expiré.'], 400);
        }

        // Vérification et mise à jour en force
        $entreprise->email_verified_at = now();
        $entreprise->activation_token = null;
        $entreprise->is_active = true;
        $entreprise->save();

        return response()->json(['message' => 'Email vérifié avec succès !'], 200);
    }

    public function hasFlouciCredentials(Request $request)
    {
        $entreprise = $request->user();

        return response()->json([
            'has_credentials' => !empty($entreprise->flouci_public_key) &&
                !empty($entreprise->flouci_secret_key) &&
                !empty($entreprise->flouci_developer_id)
        ]);
    }



    /**
     * Connexion entreprise
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $entreprise = Entreprise::where('email', $request->email)->first();

        if (!$entreprise || !Hash::check($request->password, $entreprise->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les informations d’identification sont incorrectes.'],
            ]);
        }
        if (!$entreprise->email_verified_at) {
            return response()->json(['message' => 'Veuillez vérifier votre email avant de vous connecter.'], 403);
        }


        $token = $entreprise->createToken('auth_token')->plainTextToken;

        $this->createSession($entreprise, $token, $request, 'entreprise');

        return response()->json([
            'entreprise' => $entreprise,
            'token' => $token,
        ]);
    }

    /**
     * Déconnexion entreprise
     */
    public function logout(Request $request)
    {
        DB::transaction(function () use ($request) {
            $entreprise = $request->user();

            // Supprimer la session
            DB::table('sessions')->where('user_id', $entreprise->id)->delete();
            // Supprimer les tokens
            $entreprise->tokens()->delete();
        });
        return response()->json(['message' => 'Déconnexion réussie']);
    }
    /**
     * Mettre à jour le profil entreprise
     */
    //v3.0
    public function updateProfile(Request $request)
    {
        try {
            DB::beginTransaction();
            $entreprise = $request->user();

            $validatedData = $request->validate([
                'nomE' => 'required|string|max:255',
                'email' => 'required|email|unique:entreprises,email,' . $entreprise->id,
                'matriculeE' => 'required|string',
                'villeE' => 'required|string',
                'adresseE' => 'required|string',
                'lien_facebook_E' => 'nullable|string',
                'lien_site_E' => 'nullable|string',
                'logoE' => 'nullable|string|exists:entreprises,logoE'
            ]);

            foreach ($validatedData as $field => $value) {
                if ($request->has($field)) {
                    $entreprise->$field = $value;
                }
            }

            $entreprise->save();
            DB::commit();

            return response()->json([
                'message' => 'Profile updated successfully',
                'entreprise' => $entreprise->fresh() // Changé de 'user' à 'entreprise'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update Error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function updateFlouciCredentials(Request $request)
    {
        try {
            DB::beginTransaction();

            $entreprise = $request->user();

            $validatedData = $request->validate([
                'flouci_public_key' => 'required|string',
                'flouci_secret_key' => 'required|string',
                'flouci_developer_id' => 'required|string'
            ]);

            // Encryption des données sensibles
            $entreprise->flouci_public_key = encrypt($validatedData['flouci_public_key']);
            $entreprise->flouci_secret_key = encrypt($validatedData['flouci_secret_key']);
            $entreprise->flouci_developer_id = encrypt($validatedData['flouci_developer_id']);

            $entreprise->save();

            DB::commit();

            return response()->json([
                'message' => 'Informations Flouci mises à jour avec succès',
                'entreprise' => $entreprise->fresh()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur mise à jour Flouci:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Erreur lors de la mise à jour des informations Flouci'], 500);
        }
    }
    /** * Desactiver  le compte entreprise new version  */
    public function desactiverProfile(Request $request)
    {
        DB::transaction(function () use ($request) {
            $entreprise = $request->user();

            // Désactiver le compte
            $entreprise->is_active = false;
            $entreprise->activation_token = Str::random(64);
            $entreprise->save();

            // Créer l'enregistrement de désactivation
            $desactivation = Desactivation::create([
                'entreprise_id' => $entreprise->id,
                'type' => 'entreprise',
                'date_debut' => now(),
                'date_fin' => Carbon::now()->addDays(28),
                'is_deleted' => false,
            ]);

            // Supprimer toutes les sessions actives
            DB::table('sessions')
                ->where('user_id', $entreprise->id)
                ->delete();

            // Supprimer tous les tokens
            $entreprise->tokens()->delete();

            // Envoyer l'email
            Mail::to($entreprise->email)->send(new VerifyEmailEn($entreprise));

            return $desactivation; // Pour pouvoir l'utiliser dans la réponse
        });

        return response()->json([
            'message' => 'Votre compte entreprise a été désactivé.',
            'data' => $desactivation ?? null
        ]);
    }
    public function getEntrepriseDetails(Request $request)
    {
        $entreprise = $request->user();
        $session = DB::table('sessions')
            ->where('user_id', $entreprise->id)
            ->first();

        return response()->json([
            'entreprise' => $entreprise,
            'session_info' => [
                'last_activity' => Carbon::createFromTimestamp($session->last_activity),
                'ip_address' => $session->ip_address,
                'user_agent' => $session->user_agent
            ]
        ]);
    }
    /**
     * Télécharger un logo pour une entreprise
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpg,png,jpeg|max:4096', // Validation du fichier
        ]);

        $entreprise = $request->user();

        // Supprimer l'ancien logo si existant
        if ($entreprise->logoE) {
            Storage::disk('public')->delete($entreprise->logoE);
        }

        // Stocker le nouveau logo
        $path = $request->file('logo')->store('entreprises', 'public');
        $entreprise->logoE = $path;
        $entreprise->save();

        return response()->json([
            'message' => 'Logo uploaded successfully',
            'path' => $path,
        ]);
    }
    //v3.0
    public function getEntrepriseById($id)
    {
        try {
            $entreprise = Entreprise::findOrFail($id);

            return response()->json([
                'entreprise' => [
                    'id' => $entreprise->id,
                    'nomE' => $entreprise->nomE,
                    'email' => $entreprise->email,
                    'villeE' => $entreprise->villeE,
                    'adresseE' => $entreprise->adresseE,
                    'logoE' => $entreprise->logoE,
                    'flouci_public_key' => $entreprise->flouci_public_key ? decrypt($entreprise->flouci_public_key) : null,
                    'flouci_secret_key' => $entreprise->flouci_secret_key ? decrypt($entreprise->flouci_secret_key) : null,
                    'flouci_developer_id' => $entreprise->flouci_developer_id ? decrypt($entreprise->flouci_developer_id) : null
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching entreprise:', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Entreprise not found'], 404);
        }
    }

    public function show($id)
{
    try {
        $entreprise = Entreprise::findOrFail($id);
        return response()->json([
            'id' => $entreprise->id,
            'nomE' => $entreprise->nomE,
            'email' => $entreprise->email,
            'adresse' => $entreprise->adresseE,
            'logoE' => $entreprise->logoE,
            'lien_facebook_E' => $entreprise->lien_facebook_E,
            'lien_site_E' => $entreprise->lien_site_E,
        ]);
    } catch (\Exception $e) {
        Log::error('Error fetching entreprise:', ['id' => $id, 'error' => $e->getMessage()]);
        return response()->json(['error' => 'Entreprise not found'], 404);
    }
}
    //v2.0
    // public function getEntrepriseById($id)
    // {
    //     try {
    //         $entreprise = Entreprise::select('id', 'nomE', 'email', 'villeE', 'adresseE', 'logoE', 'flouci_public_key', 'flouci_secret_key', 'flouci_developer_id')
    //             ->findOrFail($id);
    //         return response()->json(['entreprise' => $entreprise]); // Wrap in 'entreprise' key
    //     } catch (\Exception $e) {
    //         Log::error('Error fetching entreprise:', ['id' => $id, 'error' => $e->getMessage()]);
    //         return response()->json(['error' => 'Entreprise not found'], 404);
    //     }
    // }
    //v1.0
    // public function getEntrepriseById($id)
    // {
    //     try {
    //         $entreprise = Entreprise::select('id', 'nomE', 'email', 'villeE', 'adresseE', 'logoE','flouci_public_key','flouci_secret_key','flouci_developer_id')
    //             ->findOrFail($id);
    //         return response()->json($entreprise);
    //     } catch (\Exception $e) {
    //         Log::error('Error fetching entreprise:', ['id' => $id, 'error' => $e->getMessage()]);
    //         return response()->json(['error' => 'Entreprise not found'], 404);
    //     }
    // }
    public function getBatchEnterprises(Request $request)
    {
        $ids = $request->get('ids', []);
        $enterprises = Entreprise::whereIn('id', $ids)
            ->select('id', 'nomE', 'email')
            ->get();

        return response()->json($enterprises);
    }
}
