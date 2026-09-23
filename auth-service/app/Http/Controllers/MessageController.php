<?php
namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Http\Request;
use App\Models\Entreprise;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller {

    // public function store(Request $request) {
    //     $request->validate([
    //         'conversation_id' => 'nullable|exists:conversations,id',
    //         'content' => 'required|string',
    //         'receiver_id' => 'required|integer', // ID du destinataire
    //         'receiver_type' => 'required|string|in:user,entreprise,admin', // Type du destinataire
    //     ]);
    
    //     $user = $request->user();
    
    //     // Vérifiez si une conversation existe déjà
    //     $conversation = Conversation::where(function ($query) use ($user, $request) {
    //         $query->where('user_id', $user->id)
    //               ->where('entreprise_id', $request->receiver_id)
    //               ->where('type', 'user-and-entreprise');
    //     })->orWhere(function ($query) use ($user, $request) {
    //         $query->where('user_id', $request->receiver_id)
    //               ->where('entreprise_id', $user->id)
    //               ->where('type', 'user-and-entreprise');
    //     })->first();
    
    //     // Si la conversation n'existe pas, créez-la
    //     if (!$conversation) {
    //         $type = null;
    
    //         // Déterminez le type de conversation en fonction du destinataire
    //         if ($request->receiver_type === 'user') {
    //             $type = 'user-and-entreprise';
    //         } elseif ($request->receiver_type === 'admin') {
    //             $type = 'entreprise-to-admin';
    //         }
    
    //         $conversation = Conversation::create([
    //             'type' => $type,
    //             'user_id' => $request->receiver_type === 'user' ? $request->receiver_id : null,
    //             'entreprise_id' => $request->receiver_type === 'entreprise' ? $request->receiver_id : $user->id,
    //         ]);
    //     }
    //    // Définir le sender_type en fonction du rôle de l'utilisateur connecté
    //    $senderType = $user->role ?? ($user instanceof \App\Models\Entreprise ? 'entreprise' : 'user');

    //     // Créez le message
    //     $message = Message::create([
    //         'conversation_id' => $conversation->id,
    //         'sender_id' => $user->id,
    //      'sender_type' => $user instanceof \App\Models\Entreprise ? 'entreprise' : 'user',
    //         'content' => $request->content,
    //     ]);
    
    //     return response()->json($message, 201);
    // }


protected function containsBadWordsWithAI($text) {
    try {
        $apiKey = 'AIzaSyCtTW34GAudQuuNdysrQTurQdGUPQVUDmg';
     
$endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . $apiKey;

        $prompt = "Ce texte contient-il des insultes, propos haineux ou mots inappropriés ? Réponds uniquement par OUI ou NON. Texte : \"$text\"";

        $response = Http::post($endpoint, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ]);

        $result = $response->json();
        Log::info('Gemini moderation response:', $result);

       $output = strtolower($result['candidates'][0]['content']['parts'][0]['text'] ?? '');
Log::info('Gemini output:', [$output]);
 return str_contains($output, 'oui'); // Bloque si la réponse contient "oui"
    } catch (\Exception $e) {
        Log::error('Erreur Gemini API: ' . $e->getMessage());
        return true; // Bloque par sécurité
    }
}
public function store(Request $request)
{
    $request->validate([
        'content' => 'required|string',
        'conversation_id' => 'nullable|exists:conversations,id',
        'receiver_id' => 'required_without:conversation_id|integer',
        'receiver_type' => 'required_without:conversation_id|in:user,entreprise,admin',
    ]);
   // Liste de mots indécents à filtrer
   if ($this->containsBadWordsWithAI($request->content)) {
        return response()->json(['error' => 'Votre message contient des mots inappropriés.'], 422);
    }


// Vérifie si le message ne contient AUCUNE lettre ni chiffre (donc que des stickers ou caractères spéciaux)
if (!preg_match('/[\p{L}\p{N}]/u', $request->content)) {
    return response()->json(['error' => 'Veuillez écrire un message textuel et pertinent. Les stickers ou caractères spéciaux seuls ne sont pas autorisés.'], 422);
}

    $user = $request->user();

    // Si conversation_id est fourni, on utilise directement la conversation
    if ($request->filled('conversation_id')) {
        $conversation = Conversation::find($request->conversation_id);
        if (!$conversation) {
            return response()->json(['error' => 'Conversation introuvable.'], 404);
        }
    } else {
        // Recherche ou création de la conversation selon le rôle
        $type = null;
        $userId = null;
        $entrepriseId = null;
        $adminId = null;

        if ($user->role === 'admin') {
            $type = $request->receiver_type === 'user' ? 'admin-and-user' : 'admin-and-entreprise';
            $adminId = $user->id;
            if ($request->receiver_type === 'user') {
                $userId = $request->receiver_id;
            } else {
                $entrepriseId = $request->receiver_id;
            }
        } elseif ($user->role === 'user') {
            $type = 'user-and-entreprise';
            $userId = $user->id;
            $entrepriseId = $request->receiver_id;
        } elseif ($user instanceof \App\Models\Entreprise) {
            if ($request->receiver_type === 'admin') {
                $type = 'admin-and-entreprise';
                $adminId = $request->receiver_id;
                $entrepriseId = $user->id;
            } else {
                $type = 'user-and-entreprise';
                $userId = $request->receiver_id;
                $entrepriseId = $user->id;
            }
        } else {
            return response()->json(['error' => 'Utilisateur non autorisé.'], 403);
        }

        $conversation = Conversation::where('type', $type)
            ->where(function ($query) use ($userId, $entrepriseId, $adminId) {
                if ($userId) $query->where('user_id', $userId);
                if ($entrepriseId) $query->where('entreprise_id', $entrepriseId);
                if ($adminId) $query->where('admin_id', $adminId);
            })
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'type' => $type,
                'user_id' => $userId,
                'entreprise_id' => $entrepriseId,
                'admin_id' => $adminId,
            ]);
        }
    }

    // Définir le sender_type en fonction du rôle de l'utilisateur connecté
    $senderType = $user->role ?? ($user instanceof \App\Models\Entreprise ? 'entreprise' : 'user');
$messageCount = \App\Models\Message::where('conversation_id', $conversation->id)->count();
if ($messageCount >= 5) {
    return response()->json(['error' => 'Vous ne pouvez pas envoyer plus de 5 messages dans cette conversation.'], 403);
}
    // Créez le message
    $message = Message::create([
        'conversation_id' => $conversation->id,
        'sender_id' => $user->id,
        'sender_type' => $senderType,
        'content' => $request->content,
    ]);

    return response()->json($message, 201);
}


}