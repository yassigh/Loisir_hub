<?php

namespace App\Http\Controllers\Activites;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Poste;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;


class PosteController extends Controller
{
    //v2.0
    public function index(Request $request)
    {
        try {
            // Récupérer toutes les publications approuvées
            $query = Poste::with(['categorie', 'images'])
                ->where('status', 'approved');

            // Récupérer les publications filtrées en fonction des abonnements des entreprises
            $postes = $query->get();

            // Extraire les IDs des entreprises propriétaires des publications
            $entrepriseIds = $postes->pluck('entreprise_id')->unique();

            // Appeler l'API `auth-service` pour récupérer les limites d'abonnement pour toutes les entreprises
            $response = Http::withHeaders([
                'Authorization' => $request->header('Authorization')
            ])->post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/subscriptions/batch-limits', [
                'entreprise_ids' => $entrepriseIds->toArray()
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'Échec de la récupération des limites d\'abonnement',
                    'postes' => []
                ], 403);
            }

            $limitsData = $response->json()['limits'];

            // Filtrer les publications en fonction des limites d'abonnement
            $filteredPostes = $postes->filter(function ($poste) use ($limitsData) {
                $entrepriseId = $poste->entreprise_id;
                $limit = $limitsData[$entrepriseId] ?? null;

                // Vérifier si l'entreprise a un abonnement valide
                if (!$limit || Carbon::now()->gt($limit['end_date'])) {
                    return false; // Abonnement expiré ou inexistant
                }

                // Trier les publications de l'entreprise par ordre chronologique (ou autre critère)
                $sortedPosts = Poste::where('entreprise_id', $entrepriseId)
                    ->where('status', '!=', 'rejected')
                    ->orderBy('created_at', 'asc') // Tri par date de création (plus ancien d'abord)
                    ->get();

                // Retenir uniquement les publications dans la limite
                $postsWithinLimit = $sortedPosts->take($limit['posts_limit']);

                // Vérifier si la publication courante fait partie des publications autorisées
                return $postsWithinLimit->contains('id', $poste->id);
            });

            return response()->json(['postes' => $filteredPostes]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Une erreur est survenue lors de la récupération des publications',
                'details' => $e->getMessage()
            ], 500);
        }
    }
    //v1.1
    // public function index(Request $request)
    // {
    //     try {
    //         $query = Poste::with(['categorie', 'images']);

    //         if ($request->has('categorie_id')) {
    //             $query->where('categorie_id', $request->categorie_id);
    //         }

    //         // Si non admin, montrer seulement approved
    //         if (!$request->user_data || $request->user_data['user']['type'] !== 'admin') {
    //             $query->where('status', 'approved');
    //         }

    //         $postes = $query->get();

    //         // Transformation des données
    //         $formattedPostes = $postes->map(function ($poste) {
    //             return [
    //                 'id' => $poste->id,
    //                 'nomPoste' => $poste->nomPoste,
    //                 'descriptionPoste' => $poste->descriptionPoste,
    //                 'lieuPoste' => $poste->lieuPoste,
    //                 'regionPoste' => $poste->regionPoste,
    //                 'image' => $poste->images->first() ? $poste->images->first()->url : null,
    //                 'categorie' => $poste->categorie ? $poste->categorie->nomCat : null
    //             ];
    //         });

    //         return response()->json(['postes' => $formattedPostes]);
    //     } catch (\Exception $e) {
    //         Log::error('Erreur dans PosteController@index: ' . $e->getMessage());
    //         return response()->json([
    //             'message' => 'Erreur lors de la récupération des posts',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }
    //v1.0
    /**
     * Afficher la liste de tous les postes.
     */
    // public function index(Request $request)
    // {
    //     $query = Poste::with(['categorie', 'images']);
    //     // Filtre par catégorie
    //     if ($request->has('categorie_id')) {
    //         $query->where('categorie_id', $request->categorie_id);
    //     }

    //     // Si non admin, montrer seulement approved
    //     if ($request->user_data['user']['type'] !== 'admin') {
    //         $query->where('status', 'approved');
    //     }

    //     $postes = $query->get();
    //     return response()->json(['postes' => $postes]);
    //     //$postes = Poste::with(['categorie', 'images'])->get();
    //     //return response()->json(['postes' => $postes], 200);
    // }

    /**
     * Ajouter un nouveau poste.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nomPoste' => 'required|string|max:255',
            'descriptionPoste' => 'required|string',
           
            'typePoste' => 'required|string',
            'categorie_id' => 'required|exists:categories,id'
        ]);


        $validated['status'] = 'pending';
        $validated['entreprise_id'] = $request->user_data['user']['id'];

        $poste = Poste::create($validated);

        // Get enterprise data
        $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $validated['entreprise_id']);
        $entrepriseData = $entrepriseResponse->json();

        // Send notification
        $notificationResponse = Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/send', [
            'type' => 'new_post',
            'data' => [
                'post_id' => $poste->id,
                'post_name' => $poste->nomPoste,
               
                'post_type' => $poste->typePoste,
                'enterprise_id' => $poste->entreprise_id,
                'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
            ]
        ]);

        return response()->json([
            'message' => 'Poste créé avec succès',
            'id' => $poste->id,
            'poste' => [
                'id' => $poste->id,
                ...array_intersect_key($poste->toArray(), array_flip([
                    'nomPoste',
                    'descriptionPoste',
                    
                    'typePoste',
                    'categorie_id',
                    'status',
                    'entreprise_id'
                ]))
            ]
        ], 201);
    }

    /**
     * Afficher un poste spécifique.
     */
    public function show($id)
    {
        $poste = Poste::with(['categorie', 'images'])->findOrFail($id);
        return response()->json(['poste' => $poste], 200);
    }

    /**
     * Mettre à jour un poste.
     */
    //v2.0
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'nomPoste' => 'sometimes|string|max:255',
                'descriptionPoste' => 'sometimes|string',
                'lieuPoste' => 'sometimes|string',
                'regionPoste' => 'sometimes|string',
                'typePoste' => 'sometimes|string',
                'categorie_id' => 'sometimes|exists:categories,id'
            ]);

            $poste = Poste::findOrFail($id);
            $oldPost = $poste->toArray();

            $poste->update($request->all());

            // Get enterprise data
            $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $poste->entreprise_id);
            $entrepriseData = $entrepriseResponse->json();

            // Send notification
            $notificationResponse = Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/send', [
                'type' => 'post_modified',
                'data' => [
                    'old_post' => $oldPost,
                    'new_post' => $poste->toArray(),
                    'enterprise_id' => $poste->entreprise_id,
                    'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                    'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
                ]
            ]);

            return response()->json([
                'message' => 'Poste mis à jour avec succès',
                'poste' => $poste
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating post:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    //v1.0
    // public function update(Request $request, $id)
    // {
    //     $request->validate([
    //         'nomPoste' => 'sometimes|string|max:255',
    //         'descriptionPoste' => 'sometimes|string',
    //         'lieuPoste' => 'sometimes|string',
    //         'regionPoste' => 'sometimes|string',
    //         'typePoste' => 'sometimes|string',
    //         'categorie_id' => 'sometimes|exists:categories,id'
    //     ]);

    //     $poste = Poste::findOrFail($id);
    //     $poste->update($request->all());
    //     return response()->json(['message' => 'Poste mis à jour avec succès', 'poste' => $poste], 200);
    // }

    /**
     * Supprimer un poste.
     */
    //v2.0
    public function destroy($id)
    {
        try {
            $poste = Poste::findOrFail($id);
            $postData = $poste->toArray();

            // Get enterprise data
            $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $poste->entreprise_id);
            $entrepriseData = $entrepriseResponse->json();

            $poste->delete();

            // Send notification
            $notificationResponse = Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/send', [
                'type' => 'post_deleted',
                'data' => [
                    'post_name' => $postData['nomPoste'],
                    'post_lieu' => $postData['lieuPoste'],
                    'enterprise_id' => $postData['entreprise_id'],
                    'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                    'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
                ]
            ]);

            return response()->json(['message' => 'Poste supprimé avec succès']);
        } catch (\Exception $e) {
            Log::error('Error deleting post:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    //v1.0
    // public function destroy($id)
    // {
    //     $poste = Poste::find($id);
    //     if (!$poste) {
    //         return response()->json(['message' => 'Poste non trouvé'], 404);
    //     }

    //     $poste->delete();

    //     return response()->json(['message' => 'Poste supprimé avec succès'], 200);
    // }
    // Nouvelle méthode pour admin
    //v2.0
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:approved,rejected'
            ]);

            $poste = Poste::findOrFail($id);
            $poste->update(['status' => $request->status]);

            // Récupérer les infos de l'entreprise
            $entrepriseResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $poste->entreprise_id);
            $entrepriseData = $entrepriseResponse->json();

            // Envoyer notification
            Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendEntreprise', [
                'type' => 'post_status_changed',
                'target_type' => 'entreprise',
                'target_id' => $poste->entreprise_id,
                'data' => [
                    'post_id' => $poste->id,
                    'post_name' => $poste->nomPoste,
                    'post_lieu' => $poste->lieuPoste,
                    'status' => $request->status,
                    'enterprise_id' => $poste->entreprise_id,
                    'enterprise_name' => $entrepriseData['nomE'] ?? 'Non spécifié',
                    'enterprise_email' => $entrepriseData['email'] ?? 'Non spécifié'
                ]
            ]);

            return response()->json(['message' => 'Status updated successfully']);
        } catch (\Exception $e) {
            Log::error('Error updating post status:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    //v1.0
    // public function updateStatus(Request $request, $id)
    // {
    //     $request->validate(['status' => 'required|in:approved,rejected']);

    //     $poste = Poste::findOrFail($id);
    //     $poste->update(['status' => $request->status]);

    //     return response()->json(['message' => 'Status updated']);
    // }

    public function getAllForAdmin()
    {
        try {
            $postes = Poste::with(['categorie', 'images'])->get();
            return response()->json(['postes' => $postes]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching activities',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    


public function getEntreprisePosts(Request $request)
{
    $entrepriseId = $request->user_data['user']['id'];
    $posts = Poste::with('images')->where('entreprise_id', $entrepriseId)->get();
    return response()->json(['postes' => $posts]);
}
    // public function getEntreprisePosts(Request $request)
    // {
    //     try {
    //         $entrepriseId = $request->user_data['user']['id'];

    //         $postes = Poste::with(['categorie', 'images'])
    //             ->where('entreprise_id', $entrepriseId)
    //             ->get();

    //         return response()->json([
    //             'postes' => $postes
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'Error fetching enterprise posts',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }
}
