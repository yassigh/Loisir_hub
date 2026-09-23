<?php
namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Entreprise;
use Illuminate\Support\Facades\Log;
use App\Models\Commentaire;


class ConversationController extends Controller {

    public function index(Request $request)
    {
        $user = $request->user();
    
        if ($user->role === 'user') {
            $conversations = Conversation::with(['messages', 'entreprise'])
                ->where('user_id', $user->id)
                ->get();
        } elseif ($user instanceof Entreprise) {
            $conversations = Conversation::with(['messages', 'user', 'admin'])
                ->where('entreprise_id', $user->id)
                ->get();
        } elseif ($user->role === 'admin') {
            $conversations = Conversation::with(['messages', 'user', 'entreprise'])
            ->where('admin_id', $user->id) // Filtrer par admin_id
            ->get();
        } else {
            return response()->json(['error' => 'Utilisateur non autorisé.'], 403);
        }
    
        return response()->json($conversations);
    }

 
    // public function store(Request $request)
    // { 
    //     $user = $request->user();
    
    //     // Déterminez si l'utilisateur connecté est un utilisateur ou une entreprise
    //     if ($user->role === 'user') {
    //         $userId = $user->id;
    //         $entrepriseId = $request->entreprise_id; // Doit être fourni dans la requête
    //         $type = 'user-and-entreprise'; // Type défini pour utilisateur vers entreprise
    //     } elseif ($user instanceof Entreprise) {
    //         $userId = $request->user_id; // Doit être fourni dans la requête
    //         $entrepriseId = $user->id;
    //         $type = 'user-and-entreprise'; // Type défini pour entreprise vers utilisateur
    //     } else {
    //         return response()->json(['error' => 'Utilisateur non autorisé.'], 403);
    //     }
    
    //     // Validez les données
    //     $request->validate([
    //         'user_id' => 'required|exists:users,id',
    //         'entreprise_id' => 'required|exists:entreprises,id',
    //     ]);
    
    //     // Créez la conversation
    //     $conversation = Conversation::create([
    //         'type' => $type,
    //         'user_id' => $userId,
    //         'entreprise_id' => $entrepriseId,
    //     ]);
    
    //     return response()->json($conversation, 201);
    // }
    // public function store(Request $request)
    // {
    //     $request->validate([
    //         'content' => 'required|string',
    //         'receiver_id' => 'required|integer',
    //         'receiver_type' => 'required|string|in:user,entreprise,admin',
    //     ]);
    
    //     $user = $request->user();
    
    //     // Vérifiez si une conversation existe déjà
    //     $conversation = Conversation::where(function ($query) use ($user, $request) {
    //         if ($user->role === 'admin') {
    //             $query->where('admin_id', $user->id)
    //                   ->where(function ($subQuery) use ($request) {
    //                       $subQuery->where('user_id', $request->receiver_id)
    //                                ->orWhere('entreprise_id', $request->receiver_id);
    //                   });
    //         } elseif ($user->role === 'user') {
    //             $query->where('user_id', $user->id)
    //                   ->where('entreprise_id', $request->receiver_id)
    //                   ->where('type', 'user-and-entreprise');
    //         } elseif ($user instanceof Entreprise) {
    //             $query->where('entreprise_id', $user->id)
    //                   ->where('user_id', $request->receiver_id)
    //                   ->where('type', 'user-and-entreprise');
    //         }
    //     })->first();
    
    //     // Si la conversation n'existe pas, créez-la
    //     if (!$conversation) {
    //         $type = null;
    
    //         if ($user->role === 'admin') {
    //             $type = $request->receiver_type === 'user' ? 'admin-and-user' : 'admin-and-entreprise';
    //         } elseif ($user->role === 'user') {
    //             $type = 'user-and-entreprise';
    //         } elseif ($user instanceof Entreprise) {
    //             $type = 'user-and-entreprise';
    //         }
    
    //         $conversation = Conversation::create([
    //             'type' => $type,
    //             'user_id' => $request->receiver_type === 'user' ? $request->receiver_id : ($user->role === 'user' ? $user->id : null),
    //             'entreprise_id' => $request->receiver_type === 'entreprise' ? $request->receiver_id : ($user instanceof Entreprise ? $user->id : null),
    //            'admin_id' => $user->receiver_type === 'admin' ?  $request->receiver_id : ($user->role === 'admin' ? $user->id : null),
    //         ]);
    //     } else {
    //         // Si la conversation existe mais que `admin_id` est NULL, mettez-le à jour
    //         if ($user->role === 'admin' && is_null($conversation->admin_id)) {
    //             $conversation->admin_id = $user->id;
    //             $conversation->save();
    //         }
    //     }
    
    //     // Créez le message
    //     $message = Message::create([
    //         'conversation_id' => $conversation->id,
    //         'sender_id' => $user->id,
    //         'sender_type' => $user->role,
    //         'content' => $request->content,
    //     ]);
    
    //     return response()->json($message, 201);
    // }
    public function store(Request $request)
{
    $request->validate([
        'user_id' => 'nullable|exists:users,id',
        'entreprise_id' => 'nullable|exists:entreprises,id',
    ]);

    $user = $request->user();

    // Vérifiez si une conversation existe déjà
    $conversation = Conversation::where(function ($query) use ($request, $user) {
        $query->where('admin_id', $user->role === 'admin' ? $user->id : null)
              ->where('user_id', $request->user_id)
              ->where('entreprise_id', $request->entreprise_id);
    })->first();

    // Si la conversation n'existe pas, créez-la
    if (!$conversation) {
        $type = null;

        if ($user->role === 'admin') {
            $type = $request->user_id ? 'admin-and-user' : 'admin-and-entreprise';
        } elseif ($user->role === 'user') {
            $type = 'user-and-entreprise';
        }

        $conversation = Conversation::create([
            'type' => $type,
            'user_id' => $request->user_id,
            'entreprise_id' => $request->entreprise_id,
            'admin_id' => $user->role === 'admin' ? $user->id : null, // Définit admin_id
        ]);
    } else {
        // Si la conversation existe mais que `admin_id` est NULL, mettez-le à jour
        if ($user->role === 'admin' && is_null($conversation->admin_id)) {
            $conversation->admin_id = $user->id;
            $conversation->save();
        }
    }

    return response()->json($conversation, 201);
}

// public function findByParticipants(Request $request)
// {
//     $userId = $request->input('user_id');
//     $entrepriseId = $request->input('entreprise_id');
//     $adminId = $request->input('admin_id');
//     $type = $request->input('type');

//     $query = Conversation::query();

//     if ($userId) {
//         $query->where('user_id', $userId);
//     }
//     if ($entrepriseId) {
//         $query->where('entreprise_id', $entrepriseId);
//     }
//     if ($adminId) {
//         $query->where('admin_id', $adminId);
//     }
//     if ($type) {
//         $query->where('type', $type);
//     }

//     $conversation = $query->first();

//     if (!$conversation) {
//         $conversation = Conversation::create([
//             'user_id' => $userId,
//             'entreprise_id' => $entrepriseId,
//             'admin_id' => $adminId,
//             'type' => $type,
//         ]);
//     }

//     return response()->json($conversation);
// }



// public function findByParticipants(Request $request)
// {
//     $user = $request->user();

//     // Si l'utilisateur connecté est un admin, ajustez les paramètres
//     if ($user->role === 'admin') {
//         $request->merge([
//             'user_id' => $request->user_id, // Ne force pas à null ici
//             'admin_id' => $user->id, // Définissez admin_id avec l'ID de l'admin connecté
//         ]);
//     }

//     // Recherchez une conversation existante
//     $conversation = Conversation::where('type', $request->input('type'))
//         ->where(function ($query) use ($request) {
//             if ($request->filled('user_id')) {
//                 $query->where('user_id', $request->input('user_id'));
//             }
//             if ($request->filled('entreprise_id')) {
//                 $query->where('entreprise_id', $request->input('entreprise_id'));
//             }
//             if ($request->filled('admin_id')) {
//                 $query->where('admin_id', $request->input('admin_id'));
//             }
//         })
//         ->first();

//     // Si la conversation n'existe pas, créez-en une nouvelle
//     if (!$conversation) {
//         $conversation = Conversation::create([
//             'type' => $request->input('type'),
//             'user_id' => $request->input('user_id'),
//             'entreprise_id' => $request->input('entreprise_id'),
//             'admin_id' => $request->input('admin_id'),
//         ]);
        
//     }

//     return response()->json($conversation);
// }
public function findByParticipants(Request $request)
{
    $user = $request->user();
//     // Si l'utilisateur connecté est un admin, ajustez les paramètres
//     if ($user->role === 'admin') {
//         $request->merge([
//             'user_id' => $request->user_id, // Ne force pas à null ici
//             'admin_id' => $user->id, // Définissez admin_id avec l'ID de l'admin connecté
//         ]);
//     }

    // Détermine le type et les IDs selon le rôle
    if ($user->role === 'admin') {
        $type = $request->input('type') ?? ($request->filled('user_id') ? 'admin-and-user' : 'admin-and-entreprise');
        $adminId = $user->id;
        $userId = $request->input('user_id');
        $entrepriseId = $request->input('entreprise_id');
    } elseif ($user->role === 'user') {
       $type = $request->input('type');
    $userId = $user->id;
    if ($type === 'admin-and-user') {
        $adminId = $request->input('admin_id');
        $entrepriseId = null;
    } else {
        $adminId = null;
        $entrepriseId = $request->input('entreprise_id');
    }
    } elseif ($user instanceof \App\Models\Entreprise) {
        $type = 'user-and-entreprise';
        $adminId = null;
        $userId = $request->input('user_id');
        $entrepriseId = $user->id;
    } else {
        return response()->json(['error' => 'Utilisateur non autorisé.'], 403);
    }

    // Recherche la conversation
    $conversation = Conversation::where('type', $type)
        ->where('user_id', $userId)
        ->where('entreprise_id', $entrepriseId)
        ->where('admin_id', $adminId)
        ->first();

    // Sinon, crée-la
    if (!$conversation) {
        $conversation = Conversation::create([
            'type' => $type,
            'user_id' => $userId,
            'entreprise_id' => $entrepriseId,
            'admin_id' => $adminId,
        ]);
    }

    return response()->json($conversation);
}
public function entrepriseToAdmin(Request $request)
{
    $user = $request->user();

    if (!($user instanceof \App\Models\Entreprise)) {
        return response()->json(['error' => 'Seules les entreprises peuvent utiliser cette route.'], 403);
    }

    $adminId = $request->input('admin_id');
    $entrepriseId = $user->id;
    $type = 'admin-and-entreprise';

    // Recherche la conversation
    $conversation = Conversation::where('type', $type)
        ->where('admin_id', $adminId)
        ->where('entreprise_id', $entrepriseId)
        ->first();

    // Sinon, crée-la
    if (!$conversation) {
        $conversation = Conversation::create([
            'type' => $type,
            'admin_id' => $adminId,
            'entreprise_id' => $entrepriseId,
        ]);
    }

    return response()->json($conversation);
}
    // public function getConnectables(Request $request)
    // {
    //     $user = $request->user();
    
    //     if ($user->role === 'admin') {
    //         // L'administrateur peut se connecter avec tous les utilisateurs et entreprises
    //         $connectables = User::where('role', 'user')->get()->merge(Entreprise::all());
    //     } elseif ($user instanceof Entreprise) {
    //         // Une entreprise peut se connecter avec les utilisateurs et les administrateurs
    //         $connectables = User::where('role', 'user')->get()->merge(User::where('role', 'admin')->get());
    //     } elseif ($user->role === 'user') {
    //         // Un utilisateur peut se connecter avec les entreprises actives et les administrateurs
    //         $connectables = Entreprise::where('is_active', 1)->get()->merge(User::where('role', 'admin')->get());
    //     } else {
    //         return response()->json(['error' => 'Utilisateur non autorisé.'], 403);
    //     }
    
    //     // Ajoutez un log pour vérifier les connectables
    //     Log::info('Connectables récupérés :', $connectables->toArray());
    
    //     return response()->json($connectables);
    // }
    public function getConnectables(Request $request)
    {
        $user = $request->user();
    
        if ($user->role === 'admin') {
            // L'administrateur peut se connecter avec tous les utilisateurs et entreprises
            $users = User::where('role', 'user')->get();
            $entreprises = Entreprise::all();
        } elseif ($user instanceof Entreprise) {
            // Une entreprise peut se connecter avec les utilisateurs et les administrateurs
            $users = User::where('role', 'user')->get();
            $admins = User::where('role', 'admin')->get();
            $entreprises = collect(); // Les entreprises ne peuvent pas se connecter à d'autres entreprises
        } elseif ($user->role === 'user') {
            // Un utilisateur peut se connecter avec les entreprises actives et les administrateurs
            $entreprises = Entreprise::where('is_active', 1)->get();
            $admins = User::where('role', 'admin')->get();
            $users = collect(); // Les utilisateurs ne peuvent pas se connecter à d'autres utilisateurs
        } else {
            return response()->json(['error' => 'Utilisateur non autorisé.'], 403);
        }
    
        // Combinez les résultats
    $connectables = $users->merge($entreprises)->merge($admins ?? collect());

    // Ajoute la date du dernier message pour chaque connectable
    $connectables = $connectables->map(function ($connectable) use ($user) {
        // Cherche la dernière conversation entre l'utilisateur connecté et ce connectable
        $conversation = \App\Models\Conversation::where(function ($query) use ($user, $connectable) {
            // Cas user connecté
            if ($user->role === 'user') {
                if ($connectable instanceof \App\Models\Entreprise) {
                    $query->where('user_id', $user->id)
                          ->where('entreprise_id', $connectable->id);
                } elseif ($connectable->role === 'admin') {
                    $query->where('user_id', $user->id)
                          ->where('admin_id', $connectable->id);
                }
            }
            // Cas entreprise connectée
            elseif ($user instanceof \App\Models\Entreprise) {
                if ($connectable->role === 'user') {
                    $query->where('user_id', $connectable->id)
                          ->where('entreprise_id', $user->id);
                } elseif ($connectable->role === 'admin') {
                    $query->where('entreprise_id', $user->id)
                          ->where('admin_id', $connectable->id);
                }
            }
            // Cas admin connecté
            elseif ($user->role === 'admin') {
                if ($connectable->role === 'user') {
                    $query->where('user_id', $connectable->id)
                          ->where('admin_id', $user->id);
                } elseif ($connectable instanceof \App\Models\Entreprise) {
                    $query->where('entreprise_id', $connectable->id)
                          ->where('admin_id', $user->id);
                }
            }
        })->first();

        // Cherche le dernier message de cette conversation
        $lastMessageDate = null;
        if ($conversation) {
            $lastMessage = \App\Models\Message::where('conversation_id', $conversation->id)
                ->orderBy('created_at', 'desc')
                ->first();
            if ($lastMessage) {
                $lastMessageDate = $lastMessage->created_at;
            }
        }

        // Ajoute la propriété à l'objet
        $connectable->last_message_date = $lastMessageDate;
        return $connectable;
    })->values();
        return response()->json($connectables);
    }
  
    public function show($id, Request $request)
    {
        $user = $request->user();
       // Ajoutez des logs pour vérifier l'utilisateur connecté
       Log::info('Utilisateur connecté :', ['id' => $user->id, 'role' => $user->role]);

        // Vérifiez si l'utilisateur ou l'entreprise est impliqué dans la conversation
        // $conversation = Conversation::with('messages')
        //     ->where('id', $id)
        //     ->where(function ($query) use ($user) {
        //         $query->where('user_id', $user->id)
        //               ->orWhere('entreprise_id', $user->id);
        //     })
        //     ->where('type', 'user-and-entreprise') // Assurez-vous que le type est correct
        //     ->first();
     // Vérifiez si l'utilisateur ou l'entreprise est impliqué dans la conversation
     $conversationQuery = Conversation::with('messages')
        ->where('id', $id);

    if ($user->role === 'admin') {
        // L'admin doit être impliqué dans la conversation
        $conversationQuery->where('admin_id', $user->id);
    } elseif ($user->role === 'user') {
        $conversationQuery->where('user_id', $user->id);
    } elseif ($user instanceof Entreprise) {
        $conversationQuery->where('entreprise_id', $user->id);
    } else {
        return response()->json(['error' => 'Utilisateur non autorisé.'], 403);
    }

 $conversation = $conversationQuery->first();
        if (!$conversation) {
            Log::warning('Conversation introuvable ou accès refusé.', ['conversation_id' => $id, 'user_id' => $user->id]);
            return response()->json(['error' => 'Conversation introuvable ou accès refusé.'], 404);
        }
        Log::info('Conversation trouvée :', ['conversation_id' => $conversation->id]);

        return response()->json([
            'id' => $conversation->id,
            'type' => $conversation->type,
            'messages' => $conversation->messages,
        ]);
    }
// public function show($id, Request $request)
// {
//     $user = $request->user();

//     // Ajoutez des logs pour vérifier l'utilisateur connecté
//     Log::info('Utilisateur connecté :', ['id' => $user->id, 'role' => $user->role]);

//     // Construisez la requête pour récupérer la conversation
//     $conversationQuery = Conversation::with('messages');

//     if ($user->role === 'admin') {
//         // Si l'utilisateur est un admin, vérifiez uniquement le type de conversation
//         $conversationQuery->where('id', $id)
//                           ->where('admin_id', $user->id);
//     } elseif ($user->role === 'user') {
//         // Si l'utilisateur est un user, vérifiez les colonnes user_id
//         $conversationQuery->where('id', $id)
//                           ->where('user_id', $user->id);
//     } elseif ($user instanceof Entreprise) {
//         // Si l'utilisateur est une entreprise, vérifiez les colonnes entreprise_id
//         $conversationQuery->where('id', $id)
//                           ->where('entreprise_id', $user->id);
//     } else {
//         return response()->json(['error' => 'Utilisateur non autorisé.'], 403);
//     }

//     // Récupérez la conversation
//     $conversation = $conversationQuery->first();

//     if (!$conversation) {
//         Log::warning('Conversation introuvable ou accès refusé.', ['conversation_id' => $id, 'user_id' => $user->id]);
//         return response()->json(['error' => 'Conversation introuvable ou accès refusé.'], 404);
//     }

//     Log::info('Conversation trouvée :', ['conversation_id' => $conversation->id]);

//     return response()->json([
//         'id' => $conversation->id,
//         'type' => $conversation->type,
//         'messages' => $conversation->messages,
//     ]);
// }
    public function indexForEntreprise(Request $request)
{
    try {
        $user = $request->user();

        // Vérifiez si l'utilisateur est une entreprise
        if (!$user instanceof Entreprise) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        // Récupérez les commentaires associés aux éléments de l'entreprise
        $commentaires = Commentaire::where('entreprise_id', $user->id)->get();

        return response()->json($commentaires, 200);
    } catch (\Exception $e) {
        Log::error('Erreur lors de la récupération des commentaires pour l\'entreprise: ' . $e->getMessage());
        return response()->json(['message' => 'Erreur lors de la récupération des commentaires'], 500);
    }
}
}