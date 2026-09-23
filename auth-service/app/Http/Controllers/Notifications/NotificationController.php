<?php

namespace App\Http\Controllers\Notifications;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Entreprise;
use Illuminate\Http\Request;
use App\Notifications\Activity\NewActivityCreated;
use App\Notifications\Activity\ActivityModified;
use App\Notifications\Activity\ActivityDeleted;
use App\Notifications\Activity\ActivityStatusChanged;

use App\Notifications\Event\EventModified;
use App\Notifications\Event\EventDeleted;
use App\Notifications\Event\NewEventCreated;
use App\Notifications\Event\EventStatusChanged;


use App\Notifications\Post\PostModified;
use App\Notifications\Post\PostDeleted;
use App\Notifications\Post\NewPostCreated;
use App\Notifications\Post\PostStatusChanged;

use App\Notifications\Publicite\NewPubliciteCreated;
use App\Notifications\Publicite\PubliciteModified;
use App\Notifications\Publicite\PubliciteDeleted;
use App\Notifications\Publicite\PubliciteStatusChanged;

use App\Notifications\Reservation\NewReservationCreated;
use App\Notifications\Reservation\ReservationStatusChanged;
use App\Notifications\Reservation\ReservationCancelled;
use App\Notifications\Reservation\ReservationModified;
use App\Notifications\Reservation\ReservationPaymentSuccess;
use App\Notifications\Reservation\ReservationPaymentFailed;


use App\Notifications\PayementEntreprise\PaymentSucceeded;
use App\Notifications\PayementEntreprise\PaymentFailed;

use App\Notifications\Recommendations\DailyRecommendation;
use App\Models\RecommendationCycle;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function sendToAdmins(Request $request)
    {
        try {
            Log::info('Début sendToAdmins', ['request_data' => $request->all()]);

            $admins = User::where('role', 'admin')->get();




            foreach ($admins as $admin) {
                $notificationData = $request->data;

                // Ajoute le nom de l'acteur
        if ($request->user()) {
    $name = '';
    if ($request->user() instanceof \App\Models\Entreprise) {
        $name = $request->user()->nomE;
    } elseif ($request->user()->role === 'admin' || $request->user()->role === 'user') {
        $name = $request->user()->first_name . ' ' . $request->user()->last_name;
    }
    $notificationData['actor_name'] = $name;
    $notificationData['enterprise_name'] = $name;
}
if (isset($notificationData['enterprise_id'])) {
    $entreprise = \App\Models\Entreprise::find($notificationData['enterprise_id']);
    $notificationData['enterprise_name'] = $entreprise ? $entreprise->nomE : 'Non spécifié';
}
                switch ($request->type) {
                    case 'new_activity':
                        $admin->notify(new NewActivityCreated($notificationData));
                        break;
                    case 'activity_modified':
                        $admin->notify(new ActivityModified($notificationData));
                        break;
                    case 'activity_deleted':
                        $admin->notify(new ActivityDeleted($notificationData));
                        break;
                    case 'new_event':
                        $admin->notify(new NewEventCreated($notificationData));
                        break;
                    case 'event_modified':
                        $admin->notify(new EventModified($notificationData));
                        break;
                    case 'event_deleted':
                        $admin->notify(new EventDeleted($notificationData));
                        break;
                    case 'new_post':
                        $admin->notify(new NewPostCreated($notificationData));
                        break;
                    case 'post_modified':
                        $admin->notify(new PostModified($notificationData));
                        break;
                    case 'post_deleted':
                        $admin->notify(new PostDeleted($notificationData));
                        break;
                    case 'new_publicite':
                        $admin->notify(new NewPubliciteCreated($notificationData));
                        break;
                    case 'publicite_modified':
                        $admin->notify(new PubliciteModified($notificationData));
                        break;
                    case 'publicite_deleted':
                        $admin->notify(new PubliciteDeleted($notificationData));
                        break;
                    case 'payment_success':
                        Log::info('Envoi notification à admin:', [
                            'admin_id' => $admin->id,
                            'data' => $notificationData
                        ]);
                        $admin->notify(new PaymentSucceeded($notificationData));
                        break;
                }
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Erreur dans sendToAdmins:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function sendToEntreprises(Request $request)
    {
        try {
            Log::info('Début sendStatusNotification', ['request_data' => $request->all()]);

            if ($request->target_type === 'entreprise') {
                $entreprise = Entreprise::find($request->target_id);

                if ($entreprise) {
                    switch ($request->type) {
                        case 'activity_status_changed':
                            $entreprise->notify(new ActivityStatusChanged($request->data));
                            break;
                        case 'event_status_changed':
                            $entreprise->notify(new EventStatusChanged($request->data));
                            break;
                        case 'post_status_changed':
                            $entreprise->notify(new PostStatusChanged($request->data));
                            break;
                        case 'publicite_status_changed':
                            $entreprise->notify(new PubliciteStatusChanged($request->data));
                            break;
                        case 'new_reservation':
                            $entreprise->notify(new NewReservationCreated($request->data));
                            break;
                        case 'reservation_modified':
                            $entreprise->notify(new ReservationModified($request->data));
                            break;
                        case 'reservation_cancelled':
                            $entreprise->notify(new ReservationCancelled($request->data));
                            break;
                        case 'payment_success':
                            $entreprise->notify(new PaymentSucceeded($request->data));
                            break;
                        case 'payment_failed':
                            $entreprise->notify(new PaymentFailed($request->data));
                            break;

                        case 'reservation_payment_success':
                            $entreprise->notify(new ReservationPaymentSuccess($request->data));
                            break;
                    }
                }
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Erreur notification status:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function sendToUsers(Request $request)
    {
        try {
            Log::info('Starting sendToUsers', ['request_data' => $request->all()]);

            if ($request->target_type === 'user') {
                $user = User::find($request->target_id);
                if ($user) {
                    switch ($request->type) {
                        case 'reservation_status_changed':
                            $user->notify(new ReservationStatusChanged($request->data));
                            break;
                        case 'reservation_payment_success':
                            $user->notify(new ReservationPaymentSuccess($request->data));
                            break;
                        case 'reservation_payment_failed':
                            $user->notify(new ReservationPaymentFailed($request->data));
                            break;
                    }
                }
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error sending user notification:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    // public function getNotifications(Request $request)
    // {
    //     try {
    //         $user = $request->user();

    //         if (!$user) {
    //             return response()->json([
    //                 'error' => 'Unauthorized - User not found'
    //             ], 401);
    //         }

    //         // Pour admin
    //         if ($user->role === 'admin') {
    //             $notifications = $user->notifications()
    //                 ->orderBy('created_at', 'desc')
    //                 ->get();
    //         }
    //         // Pour entreprise
    //         else if ($user instanceof Entreprise) {
    //             $notifications = $user->notifications()
    //                 ->orderBy('created_at', 'desc')
    //                 ->get();
    //         } else {
    //             return response()->json([
    //                 'error' => 'Invalid user type'
    //             ], 400);
    //         }

    //         return response()->json([
    //             'notifications' => $notifications
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Erreur récupération notifications:', [
    //             'error' => $e->getMessage(),
    //             'user_id' => $request->user() ? $request->user()->id : null
    //         ]);
    //         return response()->json([
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }
    //v2.0
    public function getNotifications(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'error' => 'Unauthorized - User not found'
                ], 401);
            }

            // Handle notifications for all user types
            if ($user->role === 'admin') {
                $notifications = $user->notifications()
                    ->orderBy('created_at', 'desc')
                    ->get();
            } elseif ($user instanceof \App\Models\Entreprise) {
                $notifications = $user->notifications()
                    ->orderBy('created_at', 'desc')
                    ->get();
            } elseif ($user->role === 'user') {
                $notifications = $user->notifications()
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                return response()->json([
                    'error' => 'Invalid user type'
                ], 400);
            }

            return response()->json([
                'notifications' => $notifications
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching notifications:', [
                'error' => $e->getMessage(),
                'user_id' => $request->user() ? $request->user()->id : null
            ]);
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
    //v1.0
    // public function getNotifications(Request $request)
    // {
    //     try {
    //         $user = $request->user();

    //         if (!$user) {
    //             return response()->json([
    //                 'error' => 'Unauthorized - User not found'
    //             ], 401);
    //         }

    //         // Pour admin ou entreprise
    //         if ($user->role === 'admin' || $user instanceof Entreprise) {
    //             $notifications = $user->notifications()
    //                 ->whereNull('read_at')  // Ajout de cette ligne pour filtrer
    //                 ->orderBy('created_at', 'desc')
    //                 ->get();
    //         } else {
    //             return response()->json([
    //                 'error' => 'Invalid user type'
    //             ], 400);
    //         }

    //         return response()->json([
    //             'notifications' => $notifications
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Erreur récupération notifications:', [
    //             'error' => $e->getMessage(),
    //             'user_id' => $request->user() ? $request->user()->id : null
    //         ]);
    //         return response()->json([
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    // public function markAsRead(Request $request, $id)
    // {
    //     try {
    //         $notification = $request->user()
    //             ->notifications()
    //             ->where('id', $id)
    //             ->first();

    //         if ($notification) {
    //             $notification->markAsRead();
    //             return response()->json(['success' => true]);
    //         }

    //         return response()->json(['error' => 'Notification non trouvée'], 404);
    //     } catch (\Exception $e) {
    //         Log::error('Erreur marquage notification:', ['error' => $e->getMessage()]);
    //         return response()->json(['error' => $e->getMessage()], 500);
    //     }
    // }

    public function markAsRead(Request $request, $id)
    {
        try {
            $notification = $request->user()
                ->notifications()
                ->where('id', $id)
                ->first();

            if (!$notification) {
                return response()->json(['error' => 'Notification non trouvée'], 404);
            }

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marquée comme lue'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur marquage notification:', [
                'error' => $e->getMessage(),
                'notification_id' => $id
            ]);
            return response()->json([
                'error' => 'Erreur lors du marquage de la notification'
            ], 500);
        }
    }

    public function markAllAsRead(Request $request)
    {
        try {
            $request->user()->unreadNotifications->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Toutes les notifications ont été marquées comme lues'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur marquage notifications:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Erreur lors du marquage des notifications'
            ], 500);
        }
    }
    public function getUnreadCount(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'error' => 'Unauthorized - User not found'
                ], 401);
            }

            // Pour admin ou entreprise
            if ($user->role === 'admin' || $user instanceof Entreprise) {
                $count = $user->unreadNotifications()->count();

                return response()->json([
                    'count' => $count
                ]);
            }

            return response()->json([
                'error' => 'Invalid user type'
            ], 400);
        } catch (\Exception $e) {
            Log::error('Erreur comptage notifications non lues:', [
                'error' => $e->getMessage(),
                'user_id' => $request->user() ? $request->user()->id : null
            ]);

            return response()->json([
                'error' => 'Erreur lors du comptage des notifications'
            ], 500);
        }
    }

    public function sendDailyRecommendations()
    {
        try {
            Log::info('Starting daily recommendations process');

            $types = ['activite_payante', 'poste', 'evenement'];
            $lastCycle = RecommendationCycle::latest()->first();

            // Get initial type
            if (!$lastCycle) {
                $currentType = $types[0];
            } else {
                $currentIndex = array_search($lastCycle->last_type, $types);
                $nextIndex = ($currentIndex + 1) % count($types);
                $currentType = $types[$nextIndex];
            }

            // Call Python API
            $response = Http::post('http://127.0.0.1:5000/api/notifications/send-daily-recommendations');

            if (!$response->successful()) {
                throw new \Exception('Failed to get recommendations from Python API');
            }

            $recommendations = $response->json();

            // Try all types if current type has no recommendations
            $tried_types = [];
            while (count($tried_types) < count($types)) {
                $tried_types[] = $currentType;

                // Check if current type has recommendations
                if (!empty($recommendations[$currentType])) {
                    // Get sent recommendations for current type
                    $sentRecommendations = RecommendationCycle::where('last_type', $currentType)
                        ->pluck('sent_recommendations')
                        ->flatten()
                        ->unique()
                        ->toArray();

                    // Filter available recommendations
                    $availableRecommendations = collect($recommendations[$currentType])
                        ->filter(function ($reco) use ($sentRecommendations) {
                            return !in_array($reco['id'], $sentRecommendations);
                        });

                    if ($availableRecommendations->isNotEmpty()) {
                        break; // Found valid recommendations
                    }
                }

                Log::info("No available recommendations for type: $currentType, trying next type");

                // Try next type
                $currentIndex = array_search($currentType, $types);
                $nextIndex = ($currentIndex + 1) % count($types);
                $currentType = $types[$nextIndex];
            }

            if (count($tried_types) >= count($types)) {
                Log::info('No recommendations available for any type, resetting cycle');
                RecommendationCycle::truncate();
                return response()->json(['message' => 'No recommendations available']);
            }

            $users = User::where('role', 'user')->get();
            $successCount = 0;
            $newSentRecommendations = [];

            foreach ($users as $user) {
                try {
                    $userRecommendation = collect($recommendations[$currentType])
                        ->where('user_id', $user->id)
                        ->filter(function ($reco) use ($sentRecommendations) {
                            return !in_array($reco['id'], $sentRecommendations);
                        })
                        ->first();

                    if ($userRecommendation) {
                        Log::info('Sending notification', [
                            'user_id' => $user->id,
                            'type' => $currentType,
                            'recommendation' => $userRecommendation
                        ]);

                        $user->notify(new DailyRecommendation([
                            'id' => $userRecommendation['id'],
                            'nom' => $userRecommendation['nom'],
                            'description' => $userRecommendation['description'],
                            'type' => $currentType,
                            'url' => $userRecommendation['url'] ?? null
                        ]));

                        $newSentRecommendations[] = $userRecommendation['id'];
                        $successCount++;
                    }
                } catch (\Exception $e) {
                    Log::error('Error processing user recommendations:', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            if ($successCount > 0) {
                RecommendationCycle::create([
                    'last_type' => $currentType,
                    'last_sent_at' => now(),
                    'sent_recommendations' => $newSentRecommendations
                ]);
            }

            return response()->json([
                'success' => true,
                'notifications_sent' => $successCount,
                'type' => $currentType
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send daily recommendations:', [
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    //v4.0
    // public function sendDailyRecommendations()
    // {
    //     try {
    //         Log::info('Starting daily recommendations process');

    //         // Get sent recommendations history
    //         $lastCycle = RecommendationCycle::latest()->first();
    //         $types = ['activite_payante', 'poste', 'evenement'];

    //         // Determine current type
    //         if (!$lastCycle) {
    //             $currentType = $types[0];
    //         } else {
    //             $currentIndex = array_search($lastCycle->last_type, $types);
    //             $nextIndex = ($currentIndex + 1) % count($types);
    //             $currentType = $types[$nextIndex];
    //         }

    //         Log::info('Selected type for today', ['type' => $currentType]);

    //         // Get all previously sent recommendations for this type
    //         $sentRecommendations = RecommendationCycle::where('last_type', $currentType)
    //             ->pluck('sent_recommendations')
    //             ->flatten()
    //             ->unique()
    //             ->toArray();

    //         // Call Python API
    //         $response = Http::post('http://127.0.0.1:5000/api/notifications/send-daily-recommendations');

    //         if (!$response->successful()) {
    //             throw new \Exception('Failed to get recommendations from Python API');
    //         }

    //         $recommendations = $response->json();

    //         if (empty($recommendations) || !isset($recommendations[$currentType])) {
    //             Log::warning('No recommendations available for type', ['type' => $currentType]);
    //             return response()->json(['message' => 'No recommendations available']);
    //         }

    //         $users = User::where('role', 'user')->get();
    //         $successCount = 0;
    //         $newSentRecommendations = [];

    //         foreach ($users as $user) {
    //             try {
    //                 // Get first unsent recommendation for user
    //                 $userRecommendation = collect($recommendations[$currentType])
    //                     ->where('user_id', $user->id)
    //                     ->filter(function ($reco) use ($sentRecommendations) {
    //                         return !in_array($reco['id'], $sentRecommendations);
    //                     })
    //                     ->first();

    //                 // If no unsent recommendations, reset cycle for this type
    //                 if (!$userRecommendation) {
    //                     Log::info('All recommendations sent for type, resetting cycle', ['type' => $currentType]);
    //                     RecommendationCycle::where('last_type', $currentType)->delete();
    //                     $sentRecommendations = [];

    //                     // Try getting first recommendation again
    //                     $userRecommendation = collect($recommendations[$currentType])
    //                         ->where('user_id', $user->id)
    //                         ->first();
    //                 }

    //                 if ($userRecommendation) {
    //                     Log::info('Sending notification', [
    //                         'user_id' => $user->id,
    //                         'type' => $currentType,
    //                         'recommendation' => $userRecommendation
    //                     ]);

    //                     $user->notify(new DailyRecommendation([
    //                         'id' => $userRecommendation['id'],
    //                         'nom' => $userRecommendation['nom'],
    //                         'description' => $userRecommendation['description'],
    //                         'type' => $currentType,
    //                         'url' => $userRecommendation['url'] ?? null
    //                     ]));

    //                     $newSentRecommendations[] = $userRecommendation['id'];
    //                     $successCount++;
    //                 }
    //             } catch (\Exception $e) {
    //                 Log::error('Error processing user recommendations:', [
    //                     'user_id' => $user->id,
    //                     'error' => $e->getMessage()
    //                 ]);
    //             }
    //         }

    //         // Create new cycle entry
    //         if ($successCount > 0) {
    //             RecommendationCycle::create([
    //                 'last_type' => $currentType,
    //                 'last_sent_at' => now(),
    //                 'sent_recommendations' => $newSentRecommendations
    //             ]);
    //         }

    //         return response()->json([
    //             'success' => true,
    //             'notifications_sent' => $successCount,
    //             'type' => $currentType
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Failed to send daily recommendations:', [
    //             'error' => $e->getMessage()
    //         ]);
    //         return response()->json(['error' => $e->getMessage()], 500);
    //     }
    // }

}
