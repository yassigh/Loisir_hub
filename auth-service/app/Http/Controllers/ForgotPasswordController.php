<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Entreprise;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{

    // USER 
    //
    //
    //
    //

    /**
     * Étape 1 : Envoi du code de sécurité par email
     */
    public function sendResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // Générer un code de 6 chiffres
        $resetCode = mt_rand(100000, 999999);

        // Mettre à jour l'utilisateur avec le code de réinitialisation
        $user = User::where('email', $request->email)->first();
        $user->update(['reset_code' => $resetCode]);

        // Envoyer l'email avec le code
        Mail::raw("Votre code de réinitialisation est : $resetCode", function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Code de réinitialisation du mot de passe');
        });

        return response()->json(['message' => 'Un code de réinitialisation a été envoyé à votre adresse email.'], 200);
    }

    /**
     * Étape 2 : Vérification du code de sécurité
     */
    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'reset_code' => 'required|numeric|digits:6',
        ]);

        $user = User::where('email', $request->email)
            ->where('reset_code', $request->reset_code)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Code invalide ou expiré.'], 400);
        }

        return response()->json(['message' => 'Code vérifié avec succès.'], 200);
    }

    /**
     * Étape 3 : Réinitialisation du mot de passe
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'reset_code' => 'required|numeric|digits:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)
            ->where('reset_code', $request->reset_code)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Code invalide ou expiré.'], 400);
        }

        // Mettre à jour le mot de passe et supprimer le code de réinitialisation
        $user->update([
            'password' => Hash::make($request->password),
            'reset_code' => null,
        ]);

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.'], 200);
    }
    // Entreprise 
    //
    //
    //
    //
    
    /**
     * Étape 1 : Envoi du code de sécurité par email
     */
    public function sendResetCodeE(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:entreprises,email',
        ]);

        // Générer un code de 6 chiffres
        $resetCode = mt_rand(100000, 999999);

        // Mettre à jour l'utilisateur avec le code de réinitialisation
        $entreprise = \App\Models\Entreprise::where('email', $request->email)->first();
    $entreprise->update(['reset_code' => $resetCode]);

        // Envoyer l'email avec le code
        Mail::raw("Votre code de réinitialisation est : $resetCode", function ($message) use ($entreprise) {
            $message->to($entreprise->email)
                ->subject('Code de réinitialisation du mot de passe');
        });

        return response()->json(['message' => 'Un code de réinitialisation a été envoyé à votre adresse email.'], 200);
    }

    /**
     * Étape 2 : Vérification du code de sécurité
     */
    public function verifyResetCodeE(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:entreprises,email',
            'reset_code' => 'required|numeric|digits:6',
        ]);

        $entreprise = Entreprise::where('email', $request->email)
            ->where('reset_code', $request->reset_code)
            ->first();

        if (!$entreprise) {
            return response()->json(['message' => 'Code invalide ou expiré.'], 400);
        }

        return response()->json(['message' => 'Code vérifié avec succès.'], 200);
    }

    /**
     * Étape 3 : Réinitialisation du mot de passe
     */
    public function resetPasswordE(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:entreprises,email',
            'reset_code' => 'required|numeric|digits:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $entreprise = Entreprise::where('email', $request->email)
            ->where('reset_code', $request->reset_code)
            ->first();

        if (!$entreprise) {
            return response()->json(['message' => 'Code invalide ou expiré.'], 400);
        }

        // Mettre à jour le mot de passe et supprimer le code de réinitialisation
        $entreprise->update([
            'password' => Hash::make($request->password),
            'reset_code' => null,
        ]);

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.'], 200);
    }




    public function sendResetCodeAdmin(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email',
    ]);

    // Générer un code de 6 chiffres
    $resetCode = mt_rand(100000, 999999);

    // Mettre à jour l'utilisateur avec le code de réinitialisation
    $user = User::where('email', $request->email)->where('role', 'admin')->first();
    $user->update(['reset_code' => $resetCode]);

    // Envoyer l'email avec le code
    Mail::raw("Votre code de réinitialisation est : $resetCode", function ($message) use ($user) {
        $message->to($user->email)
            ->subject('Code de réinitialisation du mot de passe');
    });

    return response()->json(['message' => 'Un code de réinitialisation a été envoyé à votre adresse email.'], 200);
}

public function verifyResetCodeAdmin(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email',
        'reset_code' => 'required|numeric|digits:6',
    ]);

    $user = User::where('email', $request->email)
        ->where('reset_code', $request->reset_code)
        ->where('role', 'admin')
        ->first();

    if (!$user) {
        return response()->json(['message' => 'Code invalide ou expiré.'], 400);
    }

    return response()->json(['message' => 'Code vérifié avec succès.'], 200);
}

public function resetPasswordAdmin(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email',
        'reset_code' => 'required|numeric|digits:6',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $user = User::where('email', $request->email)
        ->where('reset_code', $request->reset_code)
        ->where('role', 'admin')
        ->first();

    if (!$user) {
        return response()->json(['message' => 'Code invalide ou expiré.'], 400);
    }

    // Mettre à jour le mot de passe et supprimer le code de réinitialisation
    $user->update([
        'password' => Hash::make($request->password),
        'reset_code' => null,
    ]);

    return response()->json(['message' => 'Mot de passe réinitialisé avec succès.'], 200);
}
}
