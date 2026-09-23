<?php

namespace App\Http\Controllers;

use App\Models\Favore;
use Illuminate\Http\Request;
use App\Models\Evenement;
use App\Models\Poste;
use App\Models\ActivitePayant;
use Illuminate\Support\Facades\Log;

class FavoreController extends Controller 
{
    public function store(Request $request) 
    {
        $request->validate([
            'entity_id' => 'required|integer',
            'entity_type' => 'required|in:activite_payants,postes,evenements',
            'event_date' => 'required|date'
        ]);

        try {
            // Récupérer les données de l'utilisateur depuis le middleware
            $userData = $request->get('user_data');
            if (!isset($userData['user']['id'])) {
                return response()->json(['message' => 'Utilisateur non authentifié'], 401);
            }

            // Vérifier si l'élément existe
            $modelClass = match ($request->entity_type) {
                'evenements' => Evenement::class,
                'postes' => Poste::class,
                'activite_payants' => ActivitePayant::class,
                default => null,
            };

            if (!$modelClass || !$modelClass::find($request->entity_id)) {
                return response()->json(['message' => 'Élément non trouvé'], 404);
            }

            // Vérifier si le favori existe déjà
            $existingFavore = Favore::where('user_id', $userData['user']['id'])
                ->where('entity_id', $request->entity_id)
                ->where('entity_type', $request->entity_type)
                ->first();

            if ($existingFavore) {
                return response()->json(['message' => 'Cet élément est déjà dans vos favoris'], 400);
            }

            // Créer le favori
            $favore = Favore::create([
                'user_id' => $userData['user']['id'],
                'entity_id' => $request->entity_id,
                'entity_type' => $request->entity_type,
                'event_date' => $request->event_date
            ]);

            return response()->json([
                'message' => 'Favori ajouté avec succès',
                'data' => $favore
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erreur création favori: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de l\'ajout aux favoris'], 500);
        }
    }

  
  
    public function destroy($id) 
{
    try {
        $userData = request()->get('user_data');
        if (!isset($userData['user']['id'])) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        $favore = Favore::where('id', $id)
            ->where('user_id', $userData['user']['id'])
            ->first();

        if (!$favore) {
            return response()->json(['message' => 'Favori non trouvé'], 404);
        }

        $favore->delete();

        return response()->json(['message' => 'Favori supprimé avec succès']);
    } catch (\Exception $e) {
        Log::error('Erreur suppression favori: ' . $e->getMessage());
        return response()->json(['message' => 'Erreur lors de la suppression du favori'], 500);
    }
}

      // 🔹 Lister les Favores d'un utilisateur
      public function index($user_id) {
        // Récupère les favoris pour l'utilisateur spécifié
        $favores = Favore::where('user_id', $user_id)->orderBy('created_at', 'desc')->get();
        return response()->json($favores);
    }


   
    public function deleteByEntity(Request $request)
    {
        $request->validate([
            'entity_id' => 'required|integer',
            'entity_type' => 'required|in:activite_payants,postes,evenements',
        ]);
    
        try {
            $user = $request->user(); // Récupérer l'utilisateur authentifié
            if (!$user) {
                Log::error('Utilisateur non authentifié');
                return response()->json(['message' => 'Utilisateur non authentifié'], 401);
            }
            Log::info('Utilisateur authentifié :', ['user_id' => $user->id]);
            Log::info('Données reçues pour suppression :', $request->all());
    
            $favore = Favore::where('user_id', $user->id)
                ->where('entity_id', $request->entity_id)
                ->where('entity_type', $request->entity_type)
                ->first();
    
                if (!$favore) {
                    return response()->json(['message' => 'Favori non trouvé'], 404);
                }
        
                $favore->delete();
    
            return response()->json(['message' => 'Favori supprimé avec succès']);
        } catch (\Exception $e) {
            Log::error('Erreur suppression favori: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la suppression du favori'], 500);
        }
    }
}