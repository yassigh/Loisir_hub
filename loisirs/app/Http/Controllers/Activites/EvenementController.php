<?php

namespace App\Http\Controllers\Activites;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Evenement;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;


class EvenementController extends Controller
{
    //v2.0
    public function index(Request $request)
    {
        try {
            // Récupérer tous les événements approuvés
            $query = Evenement::with(['categorie', 'images'])
                ->where('status', 'approved')
 ->where('date_finEvent', '>=', Carbon::now());
            // Récupérer les événements filtrés en fonction des abonnements des entreprises
            $evenements = $query->get();

            // Extraire les IDs des entreprises propriétaires des événements
            $entrepriseIds = $evenements->pluck('entreprise_id')->unique();

            // Appeler l'API `auth-service` pour récupérer les limites d'abonnement pour toutes les entreprises
            $response = Http::withHeaders([
                'Authorization' => $request->header('Authorization')
            ])->post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/subscriptions/batch-limits', [
                'entreprise_ids' => $entrepriseIds->toArray()
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'Échec de la récupération des limites d\'abonnement',
                    'evenements' => []
                ], 403);
            }

            $limitsData = $response->json()['limits'];

            // Filtrer les événements en fonction des limites d'abonnement
            $filteredEvenements = $evenements->filter(function ($evenement) use ($limitsData) {
                $entrepriseId = $evenement->entreprise_id;
                $limit = $limitsData[$entrepriseId] ?? null;

                // Vérifier si l'entreprise a un abonnement valide
                if (!$limit || Carbon::now()->gt($limit['end_date'])) {
                    return false; // Abonnement expiré ou inexistant
                }

                // Trier les événements de l'entreprise par ordre chronologique (ou autre critère)
                $sortedEvents = Evenement::where('entreprise_id', $entrepriseId)
                    ->where('status', '!=', 'rejected')
                    ->orderBy('created_at', 'asc') // Tri par date de création (plus ancien d'abord)
                    ->get();

                // Retenir uniquement les événements dans la limite
                $eventsWithinLimit = $sortedEvents->take($limit['events_limit']);

                // Vérifier si l'événement courant fait partie des événements autorisés
                return $eventsWithinLimit->contains('id', $evenement->id);
            });

            return response()->json(['evenements' => $filteredEvenements]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Une erreur est survenue lors de la récupération des événements',
                'details' => $e->getMessage()
            ], 500);
        }
    }
    //v1.1
    // public function index(Request $request)
    // {
    //     try {
    //         $query = Evenement::with(['categorie', 'images']);

    //         // Filtre par catégorie
    //         if ($request->has('categorie_id')) {
    //             $query->where('categorie_id', $request->categorie_id);
    //         }

    //         // Vérification de la présence des données utilisateur
    //         if (isset($request->user_data) && isset($request->user_data['user'])) {
    //             if ($request->user_data['user']['type'] !== 'admin') {
    //                 $query->where('status', 'approved');
    //             }
    //         } else {
    //             // Si pas connecté, montrer seulement les événements approuvés
    //             $query->where('status', 'approved');
    //         }

    //         $evenements = $query->get();
    //         return response()->json(['evenements' => $evenements]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'Erreur lors de la récupération des événements',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }
    //v1.0
    /**
     * Afficher la liste des événements.
     */
    // public function index(Request $request)
    // {

    //     $query = Evenement::with(['categorie', 'images']);
    //     // Filtre par catégorie
    //     if ($request->has('categorie_id')) {
    //         $query->where('categorie_id', $request->categorie_id);
    //     }

    //     // Si non admin, montrer seulement approved
    //     if ($request->user_data['user']['type'] !== 'admin') {
    //         $query->where('status', 'approved');
    //     }

    //     $evenements = $query->get();
    //     return response()->json(['evenements' => $evenements]);
    //     //$evenements = Evenement::with(['categorie', 'images'])->get();
    //     //return response()->json(['evenements' => $evenements], 200);
    // }

    /**
     * Ajouter un nouvel événement.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomEvent' => 'required|string|max:255',
            'descriptionEvent' => 'required|string',
            'lieuEvent' => 'required|string',
            'regionEvent' => 'required|string',
            'typeEvent' => 'required|string',
            'date_debutEvent' => 'required|date',
            'date_finEvent' => 'required|date|after_or_equal:date_debut',
            'categorie_id' => 'required|exists:categories,id'
        ]);

        $validated['status'] = 'pending';
        $validated['entreprise_id'] = $request->user_data['user']['id'];

        $evenement = Evenement::create($validated);
        // Get enterprise data
        Log::info('Récupération entreprise:', ['entreprise_id' => $validated['entreprise_id']]);

        $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $validated['entreprise_id']);
        $entrepriseData = $entrepriseResponse->json();

        // Prepare notification data
        $notificationData = [
            'type' => 'new_event',
            'data' => [
                'event_id' => $evenement->id,
                'event_name' => $evenement->nomEvent,
                'event_lieu' => $evenement->lieuEvent,
                'date_debut' => $evenement->date_debutEvent,
                'date_fin' => $evenement->date_finEvent,
                'enterprise_id' => $evenement->entreprise_id,
                'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
            ]
        ];

        // Send notification
        $notificationResponse = Http::post(
            env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/send',
            $notificationData
        );

        if (!$notificationResponse->successful()) {
            Log::error('Échec notification:', [
                'status' => $notificationResponse->status(),
                'response' => $notificationResponse->json()
            ]);
        }
        return response()->json([
            'message' => 'Événement créé avec succès',
            'id' => $evenement->id,
            'evenement' => [
                'id' => $evenement->id,
                ...array_intersect_key($evenement->toArray(), array_flip([
                    'nomEvent',
                    'descriptionEvent',
                    'lieuEvent',
                    'regionEvent',
                    'typeEvent',
                    'date_debutEvent',
                    'date_finEvent',
                    'categorie_id',
                    'status',
                    'entreprise_id'
                ]))
            ]
        ], 201);
    }

    /**
     * Afficher un événement spécifique.
     */
    public function show($id)
    {
        $evenement = Evenement::with(['categorie', 'images'])->findOrFail($id);
        return response()->json(['evenement' => $evenement], 200);
    }

    /**
     * Modifier un événement.
     */
    //v2.0
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'nomEvent' => 'sometimes|string|max:255',
                'descriptionEvent' => 'sometimes|string',
                'lieuEvent' => 'sometimes|string',
                'regionEvent' => 'sometimes|string',
                'typeEvent' => 'sometimes|string',
                'date_debutEvent' => 'sometimes|date',
                'date_finEvent' => 'sometimes|date|after_or_equal:date_debut',
                'categorie_id' => 'sometimes|exists:categories,id'
            ]);

            $evenement = Evenement::findOrFail($id);
            $oldEvent = $evenement->toArray();

            $evenement->update($request->all());

            // Get enterprise data
            $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $evenement->entreprise_id);
            $entrepriseData = $entrepriseResponse->json();

            // Send notification
            $notificationResponse = Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/send', [
                'type' => 'event_modified',
                'data' => [
                    'old_event' => $oldEvent,
                    'new_event' => $evenement->toArray(),
                    'enterprise_id' => $evenement->entreprise_id,
                    'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                    'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
                ]
            ]);

            return response()->json([
                'message' => 'Événement mis à jour avec succès',
                'evenement' => $evenement
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating event:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    //v1.0
    // public function update(Request $request, $id)
    // {
    //     $request->validate([
    //         'nomEvent' => 'sometimes|string|max:255',
    //         'descriptionEvent' => 'sometimes|string',
    //         'lieuEvent' => 'sometimes|string',
    //         'regionEvent' => 'sometimes|string',
    //         'typeEvent' => 'sometimes|string',
    //         'date_debutEvent' => 'sometimes|date',
    //         'date_finEvent' => 'sometimes|date|after_or_equal:date_debut',
    //         'categorie_id' => 'sometimes|exists:categories,id'
    //     ]);

    //     $evenement = Evenement::findOrFail($id);
    //     $evenement->update($request->all());
    //     return response()->json(['message' => 'Événement mis à jour avec succès', 'evenement' => $evenement], 200);
    // }

    /**
     * Supprimer un événement.
     */
    //v2.0
    public function destroy($id)
    {
        try {
            $evenement = Evenement::findOrFail($id);
            $eventData = $evenement->toArray();

            // Get enterprise data
            $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $evenement->entreprise_id);
            $entrepriseData = $entrepriseResponse->json();

            $evenement->delete();

            // Send notification
            $notificationResponse = Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/send', [
                'type' => 'event_deleted',
                'data' => [
                    'event_name' => $eventData['nomEvent'],
                    'event_lieu' => $eventData['lieuEvent'],
                    'enterprise_id' => $eventData['entreprise_id'],
                    'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                    'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
                ]
            ]);

            return response()->json(['message' => 'Événement supprimé avec succès']);
        } catch (\Exception $e) {
            Log::error('Error deleting event:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    //v1.0
    // public function destroy($id)
    // {
    //     $evenement = Evenement::find($id);
    //     if (!$evenement) {
    //         return response()->json(['message' => 'Événement non trouvé'], 404);
    //     }

    //     $evenement->delete();
    //     return response()->json(['message' => 'Événement supprimé avec succès'], 200);
    // }

    // Nouvelle méthode pour admin
    //v2.0
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:approved,rejected'
            ]);

            $event = Evenement::findOrFail($id);
            $event->update(['status' => $request->status]);

            // Récupérer les infos de l'entreprise
            $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $event->entreprise_id);
            $entrepriseData = $entrepriseResponse->json();

            // Envoyer notification
            Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendEntreprise', [
                'type' => 'event_status_changed',
                'target_type' => 'entreprise',
                'target_id' => $event->entreprise_id,
                'data' => [
                    'event_id' => $event->id,
                    'event_name' => $event->nomEvent,
                    'event_lieu' => $event->lieuEvent,
                    'status' => $request->status,
                    'enterprise_id' => $event->entreprise_id,
                    'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                    'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
                ]
            ]);

            return response()->json(['message' => 'Status updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    //v1.0
    // public function updateStatus(Request $request, $id)
    // {
    //     $request->validate(['status' => 'required|in:approved,rejected']);

    //     $evenement = Evenement::findOrFail($id);
    //     $evenement->update(['status' => $request->status]);

    //     return response()->json(['message' => 'Status updated']);
    // }

    public function getAllForAdmin()
    {
        try {
            $evenements = Evenement::with(['categorie', 'images'])->get();
            return response()->json(['evenements' => $evenements]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching activities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function getEntrepriseEvents(Request $request)
    {
        try {
            $entrepriseId = $request->user_data['user']['id'];

            $evenements = Evenement::with(['categorie', 'images'])
                ->where('entreprise_id', $entrepriseId)
                ->get();

            return response()->json([
                'evenements' => $evenements
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching enterprise events',
                'error' => $e->getMessage()
            ], 500);
        }
    }

public function getEventsByEntreprise($entrepriseId)
{
    $events = Evenement::with('images')->where('entreprise_id', $entrepriseId)->get();
    return response()->json($events);
}
    
}
