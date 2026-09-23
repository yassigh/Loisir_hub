<?php

namespace App\Http\Controllers\Activites;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Publicite;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;


class PubliciteController extends Controller
{
    //v2.0 index
    //     public function index(Request $request)
    // {
    //     try {
    //         // Récupérer toutes les publicités approuvées
    //         $query = Publicite::with(['images'])
    //             ->where('statut', 'approved')
    //             ->where('statutDePaiement', 'Payeé');

    //         // Récupérer les publicités filtrées en fonction des abonnements des entreprises
    //         $publicites = $query->get();

    //         // Extraire les IDs des entreprises propriétaires des publicités
    //         $entrepriseIds = $publicites->pluck('entreprise_id')->unique();

    //         // Appeler l'API `auth-service` pour récupérer les limites d'abonnement pour toutes les entreprises
    //         $response = Http::withHeaders([
    //             'Authorization' => $request->header('Authorization')
    //         ])->post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/subscriptions/batch-limits', [
    //             'entreprise_ids' => $entrepriseIds->toArray()
    //         ]);

    //         if (!$response->successful()) {
    //             return response()->json([
    //                 'message' => 'Échec de la récupération des limites d\'abonnement',
    //                 'publicites' => []
    //             ], 403);
    //         }

    //         $limitsData = $response->json()['limits'];

    //         // Filtrer les publicités en fonction des limites d'abonnement
    //         $filteredPublicites = $publicites->filter(function ($publicite) use ($limitsData) {
    //             $entrepriseId = $publicite->entreprise_id;
    //             $limit = $limitsData[$entrepriseId] ?? null;

    //             // Vérifier si l'entreprise a un abonnement valide
    //             if (!$limit || Carbon::now()->gt($limit['end_date']) || !$limit['ads_allowed']) {
    //                 return false; // Abonnement expiré ou publicités non autorisées
    //             }

    //             // Trier les publicités de l'entreprise par ordre chronologique (ou autre critère)
    //             $sortedAds = Publicite::where('entreprise_id', $entrepriseId)
    //                 ->where('statut', '!=', 'rejected')
    //                 ->orderBy('created_at', 'asc') // Tri par date de création (plus ancien d'abord)
    //                 ->get();

    //             // Retenir uniquement les publicités dans la limite
    //             $adsWithinLimit = $sortedAds->take($limit['ads_limit']); // Supposons qu'il existe une limite "ads_limit"

    //             // Vérifier si la publicité courante fait partie des publicités autorisées
    //             return $adsWithinLimit->contains('id', $publicite->id);
    //         });

    //         return response()->json(['publicites' => $filteredPublicites]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => 'Une erreur est survenue lors de la récupération des publicités',
    //             'details' => $e->getMessage()
    //         ], 500);
    //     }
    // }
    //v1.0 index
    //Liste toutes les publicités
    public function index(Request $request)
    {
        try {
            $query = Publicite::with(['images']);

            // Filtre par statut pour non-admins
            if (!isset($request->user_data['user']) || $request->user_data['user']['type'] !== 'admin') {
                $query->where('statut', 'approved')->where('payment_status', 'paid');
            }

            $publicites = $query->get();
            return response()->json(['publicites' => $publicites]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Une erreur est survenue lors de la récupération des publicités',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    // Affiche une publicité spécifique
    public function show($id)
    {
        $publicite = Publicite::with(['images'])->findOrFail($id);
        return response()->json(['publicite' => $publicite]);
    }

    // Crée une nouvelle publicité
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'date_debut' => 'required|date',
                'nbJours' => 'required|integer',
                'montantAPayer' => 'required|numeric',
                'montantAPayerParJour' => 'required|numeric'
            ]);

            $validated['statut'] = 'pending';
            $validated['payment_status'] = 'pending';
            $validated['entreprise_id'] = $request->user_data['user']['id'];

            $publicite = Publicite::create($validated);

            // Récupérer les infos de l'entreprise
            $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $validated['entreprise_id']);
            $entrepriseData = $entrepriseResponse->json();

            // Préparer les données de notification
            $notificationData = [
                'type' => 'new_publicite',
                'data' => [
                    'publicite_id' => $publicite->id,
                    'date_debut' => $publicite->date_debut,
                    'nbJours' => $publicite->nbJours,
                    'montantAPayer' => $publicite->montantAPayer,
                    'enterprise_id' => $publicite->entreprise_id,
                    'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                    'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
                ]
            ];

            // Envoyer la notification
            $notificationResponse = Http::post(
                env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/send',
                $notificationData
            );

            return response()->json([
                'message' => 'Publicité créée avec succès',
                'publicite' => $publicite
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating publicité:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Erreur lors de la création de la publicité',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Met à jour une publicité existante
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'date_debut' => 'required|date',
                'nbJours' => 'required|integer',
                'montantAPayer' => 'required|numeric',
                'montantAPayerParJour' => 'required|numeric'
            ]);

            $publicite = Publicite::findOrFail($id);
            $oldPublicite = $publicite->toArray();

            $publicite->update($request->all());

            // Notification de mise à jour de publicité
            $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $publicite->entreprise_id);
            $entrepriseData = $entrepriseResponse->json();

            $notificationData = [
                'type' => 'publicite_modified',
                'data' => [
                    'old_publicite' => $oldPublicite,
                    'new_publicite' => $publicite->toArray(),
                    'enterprise_id' => $publicite->entreprise_id,
                    'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                    'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
                ]
            ];

            Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/send', $notificationData);

            return response()->json([
                'message' => 'Publicité mise à jour avec succès',
                'publicite' => $publicite
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating publicité:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Supprime une publicité
    public function destroy($id)
    {
        try {
            $publicite = Publicite::findOrFail($id);
            $publiciteData = $publicite->toArray();

            // Notification de suppression de publicité
            $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $publicite->entreprise_id);
            $entrepriseData = $entrepriseResponse->json();

            $publicite->delete();

            $notificationData = [
                'type' => 'publicite_deleted',
                'data' => [
                    'publicite_id' => $publiciteData['id'],
                    'date_debut' => $publiciteData['date_debut'],
                    'nbJours' => $publiciteData['nbJours'],
                    'montantAPayer' => $publiciteData['montantAPayer'],
                    'enterprise_id' => $publiciteData['entreprise_id'],
                    'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                    'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
                ]
            ];

            Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/send', $notificationData);

            return response()->json(['message' => 'Publicité supprimée avec succès']);
        } catch (\Exception $e) {
            Log::error('Error deleting publicité:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Met à jour le statut d'une publicité (pour admin)
    //v2.0
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'statut' => 'required|in:approved,rejected'
            ]);

            $publicite = Publicite::findOrFail($id);
            $publicite->update(['statut' => $request->statut]);

            // Récupérer les infos de l'entreprise
            $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $publicite->entreprise_id);
            $entrepriseData = $entrepriseResponse->json();

            // Envoyer notification
            Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendEntreprise', [
                'type' => 'publicite_status_changed',
                'target_type' => 'entreprise',
                'target_id' => $publicite->entreprise_id,
                'data' => [
                    'publicite_id' => $publicite->id,
                    'date_debut' => $publicite->date_debut,
                    'nbJours' => $publicite->nbJours,
                    'montantAPayer' => $publicite->montantAPayer,
                    'statut' => $request->statut,
                    'enterprise_id' => $publicite->entreprise_id,
                    'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                    'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
                ]
            ]);

            return response()->json(['message' => 'Status updated successfully']);
        } catch (\Exception $e) {
            Log::error('Error updating publicite status:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    //v1.0
    // public function updateStatus(Request $request, $id)
    // {
    //     try {
    //         $request->validate([
    //             'statut' => 'required|in:approved,rejected',
    //         ]);

    //         $publicite = Publicite::findOrFail($id);
    //         $publicite->update(['statut' => $request->statut]);

    //         // Notification de changement de statut
    //         $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $publicite->entreprise_id);
    //         $entrepriseData = $entrepriseResponse->json();

    //         $notificationData = [
    //             'type' => 'publicite_status_changed',
    //             'data' => [
    //                 'publicite_id' => $publicite->id,
    //                 'statut' => $request->statut,
    //                 'enterprise_id' => $publicite->entreprise_id,
    //                 'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
    //                 'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
    //             ]
    //         ];

    //         Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/send', $notificationData);

    //         return response()->json(['message' => 'Statut mis à jour avec succès']);
    //     } catch (\Exception $e) {
    //         Log::error('Error updating status:', ['error' => $e->getMessage()]);
    //         return response()->json(['error' => $e->getMessage()], 500);
    //     }
    // }

    // Récupère toutes les publicités pour l'admin
    public function getAllForAdmin()
    {
        try {
            $publicites = Publicite::with(['images'])->get();
            return response()->json(['publicites' => $publicites]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des publicités',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Récupère les publicités pour une entreprise spécifique
    public function getEntreprisePublicites(Request $request)
    {
        try {
            $entrepriseId = $request->user_data['user']['id'];
            $publicites = Publicite::with(['images'])
                ->where('entreprise_id', $entrepriseId)
                ->get();

            return response()->json(['publicites' => $publicites]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des publicités de l\'entreprise',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updatePaymentStatus(Request $request, $id)
    {
        try {
            $publicite = Publicite::findOrFail($id);

            $updateData = [
                'payment_status' => $request->payment_status,
                'date_debut' => $request->date_debut,
                'date_fin' => $request->date_fin,
                'statut' => 'approved' // Mettre à jour le statut aussi
            ];

            $publicite->update($updateData);

            return response()->json([
                'message' => 'Statut de paiement mis à jour avec succès',
                'publicite' => $publicite
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating payment status:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
