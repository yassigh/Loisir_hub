<?php

namespace App\Http\Controllers;

use App\Models\Commentaire;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Entreprise;
use App\Models\Evenement;
use App\Models\Poste;
use App\Models\ActivitePayant;

use Illuminate\Support\Facades\Log;
class CommentaireController extends Controller
{
    // Lister les commentaires d'un élément spécifique
    public function index($elementType, $elementId)
    {
        try {
            $commentaires = Commentaire::where('element_type', $elementType)
                                       ->where('element_id', $elementId)
                                       ->get();
    
            return response()->json($commentaires, 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des commentaires: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la récupération des commentaires'], 500);
        }
    }

  
// public function indexE($elementType, $elementId, Request $request)
// {
//     try {
//         $user = $request->user();
//         Log::info('Utilisateur connecté :', ['id' => $user->id, 'role' => $user->role]);

//         // Déterminez la classe du modèle en fonction du type d'élément
//         $modelClass = match ($elementType) {
//             'activite_payants' => ActivitePayant::class,
//             'evenements' => Evenement::class,
//             'postes' => Poste::class,
//             default => null,
//         };

//         if (!$modelClass) {
//             Log::error('Type d\'élément invalide : ' . $elementType);
//             return response()->json(['message' => 'Type d\'élément invalide'], 400);
//         }

//         // Vérifiez si l'utilisateur est une entreprise
//         if ($user instanceof Entreprise) {
//             if (!$modelClass::where('id', $elementId)->where('entreprise_id', $user->id)->exists()) {
//                 Log::error('Accès refusé pour l\'entreprise :', ['entreprise_id' => $user->id, 'element_id' => $elementId]);
//                 return response()->json(['message' => 'Vous n\'êtes pas autorisé à voir ces commentaires'], 403);
//             }
//         }

//         // Vérifiez si l'utilisateur est un utilisateur standard
//         if ($user->role === 'user') {
//             if (!$modelClass::where('id', $elementId)->exists()) {
//                 Log::error('Élément non trouvé ou non accessible :', ['element_id' => $elementId]);
//                 return response()->json(['message' => 'Élément non trouvé ou non accessible'], 404);
//             }
//         }

//         // Récupérez les commentaires associés à l'élément
//         $commentaires = Commentaire::where('element_type', $elementType)
//                                    ->where('element_id', $elementId)
//                                    ->get();

//         Log::info('Commentaires récupérés :', ['count' => $commentaires->count()]);
//         return response()->json($commentaires, 200);
//     } catch (\Exception $e) {
//         Log::error('Erreur lors de la récupération des commentaires: ' . $e->getMessage());
//         return response()->json(['message' => 'Erreur lors de la récupération des commentaires'], 500);
//     }
// }

    // Ajouter un commentaire
    public function store(Request $request)
    {
        $request->validate([
            'contenu' => 'required|string',
            'element_id' => 'required|integer',
            'element_type' => 'required|string|in:activite_payants,evenements,postes',
        ]);

        // Récupérer l'ID de l'utilisateur depuis user_data
        if (!isset($request->user_data['user']['id'])) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }
    
        $userId = $request->user_data['user']['id'];
    
        try {
            // Vérifier si l'élément existe
            $modelClass = match ($request->element_type) {
                'activite_payants' => ActivitePayant::class,
                'evenements' => Evenement::class,
                'postes' => Poste::class,
                default => null,
            };
    
            if (!$modelClass || !$modelClass::find($request->element_id)) {
                return response()->json(['message' => 'Élément non trouvé'], 404);
            }
    
            $element = $modelClass::findOrFail($request->element_id);
    
            // Créer le commentaire
            $commentaire = Commentaire::create([
                'contenu' => $request->contenu,
                'user_id' => $userId,
                'entreprise_id' => $element->entreprise_id ?? null,
                'element_id' => $request->element_id,
                'element_type' => $request->element_type,
            ]);
    
            return response()->json($commentaire, 201);
        } catch (\Exception $e) {
            Log::error('Erreur création commentaire: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la création du commentaire'], 500);
        }
    }
    // Modifier un commentaire
    public function update(Request $request, Commentaire $commentaire)
    {
        // Vérifier si l'utilisateur authentifié est le créateur du commentaire
        if ($request->user_data['user']['id'] !== $commentaire->user_id) {
            return response()->json(['message' => 'Vous n\'êtes pas autorisé à modifier ce commentaire'], 403);
        }
    
        $request->validate(['contenu' => 'required|string']);
    
        $commentaire->update(['contenu' => $request->contenu]);
    
        return response()->json($commentaire);
    }

    // Supprimer un commentaire
    public function destroy(Request $request, Commentaire $commentaire)
{
    // Vérifier si l'utilisateur authentifié est le créateur du commentaire
    if ($request->user_data['user']['id'] !== $commentaire->user_id) {
        return response()->json(['message' => 'Vous n\'êtes pas autorisé à supprimer ce commentaire'], 403);
    }

    $commentaire->delete();
    return response()->json(['message' => 'Commentaire supprimé']);
}
public function indexForEntreprise(Request $request)
{
    try {
        // Récupérez les données utilisateur injectées par le middleware
        $userData = $request->get('user_data');

        // Vérifiez si l'utilisateur est une entreprise
        if (!$userData || $userData['user']['type'] !== 'entreprise') {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $entrepriseId = $userData['user']['id'];

        // Récupérez les commentaires associés aux éléments de l'entreprise
        $commentaires = Commentaire::where('entreprise_id', $entrepriseId)->get();

        return response()->json($commentaires, 200);
    } catch (\Exception $e) {
        Log::error('Erreur lors de la récupération des commentaires pour l\'entreprise: ' . $e->getMessage());
        return response()->json(['message' => 'Erreur lors de la récupération des commentaires'], 500);
    }
}
}
