<?php

namespace App\Http\Controllers\Activites;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ActivitePayant;
use App\Notifications\NewActivityCreated;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\SubscriptionChecker;
use Carbon\Carbon;



class ActivitePayantController extends Controller
{
    use SubscriptionChecker;
    //v3.0 index 
    public function index(Request $request)
    {
        try {
            // Récupérer toutes les activités approuvées
            $query = ActivitePayant::with(['categorie', 'images'])
                ->where('status', 'approved');

            // Récupérer les activités filtrées en fonction des abonnements des entreprises
            $activites = $query->get();
 foreach ($activites as $activite) {
        foreach ($activite->images as $image) {
            $image->url = url('/storage/' . ltrim(str_replace('\\', '/', $image->url), '/'));
        }
    }
            // Extraire les IDs des entreprises propriétaires des activités
            $entrepriseIds = $activites->pluck('entreprise_id')->unique();

            // Appeler l'API `auth-service` pour récupérer les limites d'abonnement pour toutes les entreprises
            $response = Http::withHeaders([
                'Authorization' => $request->header('Authorization')
            ])->post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/subscriptions/batch-limits', [
                'entreprise_ids' => $entrepriseIds->toArray()
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'Échec de la récupération des limites d\'abonnement',
                    'activites_payantes' => []
                ], 403);
            }

            $limitsData = $response->json()['limits'];

            // Filtrer les activités en fonction des limites d'abonnement
            $filteredActivites = $activites->filter(function ($activite) use ($limitsData) {
                $entrepriseId = $activite->entreprise_id;
                $limit = $limitsData[$entrepriseId] ?? null;

                // Vérifier si l'entreprise a un abonnement valide
                if (!$limit || Carbon::now()->gt($limit['end_date'])) {
                    return false; // Abonnement expiré ou inexistant
                }

                // Trier les activités de l'entreprise par ordre chronologique (ou autre critère)
                $sortedActivities = ActivitePayant::where('entreprise_id', $entrepriseId)
                    ->where('status', '!=', 'rejected')
                    ->orderBy('created_at', 'asc') // Tri par date de création (plus ancien d'abord)
                    ->get();

                // Retenir uniquement les activités dans la limite
                $activitiesWithinLimit = $sortedActivities->take($limit['activities_limit']);

                // Vérifier si l'activité courante fait partie des activités autorisées
                return $activitiesWithinLimit->contains('idActP', $activite->idActP);
            });

            return response()->json(['activites_payantes' => $filteredActivites]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Une erreur est survenue lors de la récupération des activités',
                'details' => $e->getMessage()
            ], 500);
        }
    }
    //v2.0 index
    // public function index(Request $request)
    // {
    //     try {
    //         // Récupérer toutes les activités approuvées
    //         $query = ActivitePayant::with(['categorie', 'images'])
    //             ->where('status', 'approved');

    //         // Récupérer les activités filtrées en fonction des abonnements des entreprises
    //         $activites = $query->get();

    //         // Extraire les IDs des entreprises propriétaires des activités
    //         $entrepriseIds = $activites->pluck('entreprise_id')->unique();

    //         // Appeler l'API `auth-service` pour récupérer les limites d'abonnement pour toutes les entreprises
    //         $response = Http::withHeaders([
    //             'Authorization' => $request->header('Authorization')
    //         ])->post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/subscriptions/batch-limits', [
    //             'entreprise_ids' => $entrepriseIds->toArray()
    //         ]);

    //         if (!$response->successful()) {
    //             return response()->json([
    //                 'message' => 'Échec de la récupération des limites d\'abonnement',
    //                 'activites_payantes' => []
    //             ], 403);
    //         }

    //         $limitsData = $response->json()['limits'];

    //         // Filtrer les activités en fonction des limites d'abonnement
    //         $filteredActivites = $activites->filter(function ($activite) use ($limitsData) {
    //             $entrepriseId = $activite->entreprise_id;
    //             $limit = $limitsData[$entrepriseId] ?? null;

    //             // Vérifier si l'entreprise a un abonnement valide
    //             if (!$limit || Carbon::now()->gt($limit['end_date'])) {
    //                 return false; // Abonnement expiré ou inexistant
    //             }

    //             // Vérifier si l'entreprise respecte ses limites
    //             $activitiesCount = ActivitePayant::where('entreprise_id', $entrepriseId)
    //                 ->where('status', '!=', 'rejected')
    //                 ->count();

    //             return $activitiesCount <= $limit['activities_limit'];
    //         });

    //         return response()->json(['activites_payantes' => $filteredActivites]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => 'Une erreur est survenue lors de la récupération des activités',
    //             'details' => $e->getMessage()
    //         ], 500);
    //     }
    // }
    /////////////////////////
    //v1.0 index
    // public function index(Request $request)
    // {
    //     try {
    //         $query = ActivitePayant::with(['categorie', 'images']);

    //         if (isset($request->user_data) && isset($request->user_data['user'])) {
    //             if ($request->user_data['user']['type'] !== 'admin') {
    //                 $query->where('status', 'approved');
    //             }
    //         } else {
    //             // For unauthenticated users, show only approved activities
    //             $query->where('status', 'approved');
    //         }

    //         if ($request->has('categorie_id')) {
    //             $query->where('categorie_id', $request->categorie_id);
    //         }

    //         $activites = $query->get();
    //         return response()->json(['activites_payantes' => $activites]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'error' => 'Une erreur est survenue lors de la récupération des activités',
    //             'details' => $e->getMessage()
    //         ], 500);
    //     }
    // }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomActP' => 'required|string|max:255',
            'descriptionP' => 'nullable|string',
            'lieuP' => 'required|string|max:255',
            'regionP' => 'required|string|max:255',
            'prixP' => 'required|string',
            'offreP' => 'nullable|string',
            'categorie_id' => 'required|exists:categories,id',
            'heure' => 'nullable|integer', // Validation pour heure
            'minute' => 'nullable|integer', // Validation pour minute
            'jours' => 'nullable|integer'
        ]);

        $validated['status'] = 'pending';
        $validated['entreprise_id'] = $request->user_data['user']['id'];

        $activite = ActivitePayant::create($validated);
        //v2.0
        // Récupérer les infos de l'entreprise avec logs détaillés
        Log::info('Tentative récupération entreprise:', ['entreprise_id' => $validated['entreprise_id']]);

        $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $validated['entreprise_id']);

        Log::info('Réponse entreprise brute:', [
            'status' => $entrepriseResponse->status(),
            'body' => $entrepriseResponse->body()
        ]);

        $entrepriseData = $entrepriseResponse->json();
        Log::info('Données entreprise:', ['data' => $entrepriseData]);
if (!is_array($entrepriseData)) {
    $entrepriseData = [];
}
$nomE = isset($entrepriseData['nomE']) ? $entrepriseData['nomE'] : 'Non spécifié';
$emailE = isset($entrepriseData['email']) ? $entrepriseData['email'] : 'Non spécifié';
        // Préparer les données de notification
        $notificationData = [
            'type' => 'new_activity',
            'data' => [
                'activity_id' => $activite->idActP,
                'activity_name' => $activite->nomActP,
                'activity_lieu' => $activite->lieuP,
                'enterprise_id' => $activite->entreprise_id,
                'enterprise_name' => $nomE,
                'enterprise_email' => $emailE
            ]
        ];

        Log::info('Données notification:', ['notification' => $notificationData]);

        // Envoyer la notification
        $notificationResponse = Http::post(
            env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/send',
            $notificationData
        );

        Log::info('Réponse notification:', [
            'status' => $notificationResponse->status(),
            'body' => $notificationResponse->json()
        ]);

        if (!$notificationResponse->successful()) {
            Log::error('Échec notification:', [
                'status' => $notificationResponse->status(),
                'response' => $notificationResponse->json()
            ]);
        }
        return response()->json([
            'message' => 'Activité payante créée avec succès',
            'id' => $activite->idActP,
            'activite_payant' => [
                'id' => $activite->idActP,
                'idActP' => $activite->idActP,
                ...array_intersect_key($activite->toArray(), array_flip([
                    'nomActP',
                    'descriptionP',
                    'lieuP',
                    'regionP',
                    'prixP',
                    'heure',
                    'minute',
                    'jours',
                    'offreP',
                    'status',
                    'entreprise_id',
                    'categorie_id'
                ]))
            ]
        ], 201);
    }

    public function show($id)
    {
        $activite = ActivitePayant::with(['categorie', 'images'])->findOrFail($id);
        return response()->json(['activite_payant' => $activite]);
    }

    //v2.0
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'nomActP' => 'required|string|max:255',
                'descriptionP' => 'nullable|string',
                'lieuP' => 'required|string|max:255',
                'regionP' => 'required|string|max:255',
                'prixP' => 'required|string',
                'offreP' => 'nullable|string',
                'categorie_id' => 'required|exists:categories,id',
                'heure' => 'nullable|integer',
                'minute' => 'nullable|integer',
                'jours' => 'nullable|integer'
            ]);

            $activite = ActivitePayant::findOrFail($id);
            $oldActivity = $activite->toArray();

            $activite->update($request->all());

            // Get enterprise data
            $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $activite->entreprise_id);
            $entrepriseData = $entrepriseResponse->json();

if (!is_array($entrepriseData) || !isset($entrepriseData['nomE'])) {
    $entrepriseData = [
        'nomE' => 'Non spécifié',
        'email' => 'Non spécifié'
    ];
}
            // Send notification
            $notificationResponse = Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/send', [
                'type' => 'activity_modified',
                'data' => [
                    'old_activity' => $oldActivity,
                    'new_activity' => $activite->toArray(),
                    'enterprise_id' => $activite->entreprise_id,
                    'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                    'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
                ]
            ]);

            return response()->json([
                'message' => 'Activité payante mise à jour avec succès',
                'activite_payant' => $activite
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating activity:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function destroy($id)
    {
        try {
            $activite = ActivitePayant::findOrFail($id);
            $activityData = $activite->toArray();

            // Get enterprise data
            $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $activite->entreprise_id);
            $entrepriseData = $entrepriseResponse->json();

            $activite->delete();

            // Send notification
            $notificationResponse = Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/send', [
                'type' => 'activity_deleted',
                'data' => [
                    'activity_name' => $activityData['nomActP'],
                    'activity_lieu' => $activityData['lieuP'],
                    'enterprise_id' => $activityData['entreprise_id'],
                    'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                    'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
                ]
            ]);

            return response()->json(['message' => 'Activité payante supprimée avec succès']);
        } catch (\Exception $e) {
            Log::error('Error deleting activity:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:approved,rejected',
                //'reason' => 'required_if:status,rejected|string|nullable'
            ]);

            $activite = ActivitePayant::findOrFail($id);
            $activite->update(['status' => $request->status]);

            // Récupérer les infos de l'entreprise
            $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $activite->entreprise_id);
            $entrepriseData = $entrepriseResponse->json();

            // Envoyer notification à l'entreprise
            $notificationResponse = Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendEntreprise', [
                'type' => 'activity_status_changed',
                'target_type' => 'entreprise',
                'target_id' => $activite->entreprise_id,
                'data' => [
                    'activity_id' => $activite->idActP,
                    'activity_name' => $activite->nomActP,
                    'activity_lieu' => $activite->lieuP,
                    'status' => $request->status,
                    //'reason' => $request->reason,
                    'enterprise_id' => $activite->entreprise_id,
                    'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                    'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
                ]
            ]);

            if (!$notificationResponse->successful()) {
                Log::error('Échec notification status:', [
                    'status' => $notificationResponse->status(),
                    //'response' => $notificationResponse->json()
                ]);
            }

            return response()->json(['message' => 'Status updated successfully']);
        } catch (\Exception $e) {
            Log::error('Error updating status:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function getAllForAdmin()
    {
        try {
            $activites = ActivitePayant::with(['categorie', 'images'])->get();
            return response()->json(['activites_payantes' => $activites]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching activities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getEntrepriseActivities(Request $request)
    {
        try {
            $entrepriseId = $request->user_data['user']['id'];

            $activites = ActivitePayant::with(['categorie', 'images'])
                ->where('entreprise_id', $entrepriseId)
                ->get();

            return response()->json([
                'activites_payantes' => $activites
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching enterprise activities',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function getActivitiesByEntreprise($entrepriseId)
    {
        $activities = ActivitePayant::with('images')->where('entreprise_id', $entrepriseId)->get();
        return response()->json($activities);
    }
}
