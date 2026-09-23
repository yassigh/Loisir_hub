<?php

namespace App\Http\Controllers\Reservations;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\ReservationHotel;
use App\Models\ReservationAct;
use App\Models\ReservationCafeResto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Panier;
use App\Models\ActivitePayant;
use App\Models\PanierItem;
use Carbon\Carbon;



class ReservationController extends Controller
{

    /**
     * Crée une nouvelle réservation.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Starting reservation creation', ['request' => $request->all()]);

            $validatedData = $request->validate([
                'id_Act' => 'required|exists:activite_payants,idActP',
                'dateCreationReservation' => 'required|date',
                'dateDebut' => 'required|date',
                'dateFin' => 'required|date|after_or_equal:dateDebut',
                'num_tel' => 'required|string|max:15',
                'montant' => 'required|numeric',
                'nbPersonnes' => 'nullable|integer|min:1',
                'description' => 'nullable|string',
                'heureDebut' => 'required',
                'heureFin' => 'required',
                'duree' => 'required|numeric|min:0',
                'nombreSeances' => 'required|integer|min:1',

            ]);
            $dateDebut = Carbon::createFromFormat('Y-m-d', $validatedData['dateDebut'])
                ->setTimeFromTimeString($validatedData['heureDebut']);

            $dateFin = Carbon::createFromFormat('Y-m-d', $validatedData['dateFin'])
                ->setTimeFromTimeString($validatedData['heureFin']);

          

            // Update the validated data with parsed dates
            $validatedData['dateDebut'] = $dateDebut->toDateString();
            $validatedData['dateFin'] = $dateFin->toDateString();
            $validatedData['heureDebut'] = $dateDebut->format('H:i');
            $validatedData['heureFin'] = $dateFin->format('H:i');
            Log::info('Data validated successfully', ['validated' => $validatedData]);

            // Get user data from middleware
            if (!isset($validatedData['duree'])) {
                $activite = ActivitePayant::findOrFail($validatedData['id_Act']);
                $dureeMinutes = ($activite->heure * 60) + $activite->minute;
                $validatedData['duree'] = ceil($dureeMinutes / 60);
            }
            $userData = $request->get('user_data');
            if (!isset($userData['user']['id'])) {
                Log::error('User not authenticated');
                return response()->json(['message' => 'Utilisateur non authentifié'], 401);
            }
            // Fetch complete user data from auth service
            $userResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/user/users/' . $userData['user']['id']);

            if (!$userResponse->successful()) {
                Log::error('Failed to fetch user details', ['response' => $userResponse->json()]);
                return response()->json(['message' => 'Erreur lors de la récupération des données utilisateur'], 500);
            }

            $completeUserData = $userResponse->json();
            $userName = $completeUserData['first_name'] . ' ' . $completeUserData['last_name'];
            // Add user_id to validated data
            $validatedData['user_id'] = $userData['user']['id'];
            //v2.0
            // Get activity and validate price data
            $activite = ActivitePayant::findOrFail($validatedData['id_Act']);
            if (!is_numeric($activite->prixP)) {
                Log::error('Invalid price', ['price' => $activite->prixP]);
                return response()->json(['message' => 'Prix invalide'], 400);
            }

            $validatedData['entreprise_id'] = $activite->entreprise_id;

            // Calculer le montant total en tenant compte du nombre de séances
            $prixOriginal = floatval($activite->prixP);
            $offre = is_numeric($activite->offreP) ? floatval($activite->offreP) : 0;
            $nombreSeances = intval($validatedData['nombreSeances']);

            // Calculer le prix avec réduction
            if ($offre > 0) {
                $reduction = ($prixOriginal * $offre) / 100;
                $montantParSeance = $prixOriginal - $reduction;
            } else {
                $montantParSeance = $prixOriginal;
            }

            // Montant final multiplié par le nombre de séances
            $montantFinal = $montantParSeance * $nombreSeances;
            $validatedData['montant'] = $montantFinal;
            $validatedData['etat'] = 'en attente';
            Log::info('Creating reservation', ['data' => $validatedData]);
            // Create reservation
            $reservation = Reservation::create($validatedData);
            $panier = Panier::firstOrCreate([
                'user_id' => $userData['user']['id']
            ]);
            // Ajouter l'item au panier
            PanierItem::create([
                'panier_id' => $panier->id,
                'reservation_id' => $reservation->id_Res,
                'prix' => $reservation->montant,
                'statut' => 'en_attente'
            ]);

            $notificationResponse = Http::post(
                env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendEntreprise',
                [
                    'type' => 'new_reservation',
                    'target_type' => 'entreprise',
                    'target_id' => $activite->entreprise_id,
                    'data' => [
                        'reservation_id' => $reservation->id_Res,
                        'activity_name' => $activite->nomActP,
                        'user_name' => $userName,
                        'user_email' => $completeUserData['email'],
                        'user_phone' => $completeUserData['numTelU'],
                        'dateDebut' => $validatedData['dateDebut'],
                        'montant' => $reservation->montant
                    ]
                ]
            );

            if (!$notificationResponse->successful()) {
                Log::warning('Failed to send notification', [
                    'response' => $notificationResponse->json()
                ]);
            }

            return response()->json([
                'message' => 'Réservation créée avec succès',
                'reservation' => $reservation
            ], 201);
        } catch (\Exception $e) {
            Log::error('Reservation creation error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Erreur lors de la création de la réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Liste toutes les réservations.
     */
    //v3.0
    public function index(Request $request)
    {
        try {
            $userData = $request->get('user_data');
            if (!isset($userData['user']['id'])) {
                return response()->json(['message' => 'Utilisateur non authentifié'], 401);
            }

            // Modification de 'activite' vers 'activitePayant'
            $reservations = Reservation::where('user_id', $userData['user']['id'])
                ->with(['activitePayant' => function ($query) {
                    $query->select('idActP', 'nomActP');
                }])
                ->get();

            return response()->json([
                'success' => true,
                'reservations' => $reservations
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur récupération réservations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des réservations',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Affiche une réservation spécifique.
     */
    //v2.0
    public function show(Request $request, $id_Res)
    {
          try {
        $reservation = Reservation::with(['activitePayant'])->where('id_Res', $id_Res)->first();
        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation non trouvée'
            ], 404);
        }
        return response()->json([
            'success' => true,
            'reservation' => $reservation
        ]);
        } catch (\Exception $e) {
            Log::error('Show reservation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Met à jour une réservation existante.
     */
    //v3.0
    public function update(Request $request, $id_Res)
    {
        try {
            // Get the existing reservation
            $reservation = Reservation::findOrFail($id_Res);

            // Check if reservation can be modified
            if ($reservation->etat !== 'en attente') {
                return response()->json([
                    'message' => 'La réservation ne peut être modifiée que si elle est en attente',
                ], 403);
            }

            // Get current reservation data
            $currentHeureDebut = $reservation->heureDebut;
            $currentHeureFin = $reservation->heureFin;

            // Validate request data
            $validatedData = $request->validate([
                'dateDebut' => 'required|date',
    'dateFin' => 'required|date|after_or_equal:dateDebut',
    'heureDebut' => 'required',
    'heureFin' => 'required',
    'num_tel' => 'string|max:15',
    'nbPersonnes' => 'nullable|integer|min:1',
    'description' => 'nullable|string',
            ]);

            // Create Carbon instances with dates and times
         $dateDebut = Carbon::createFromFormat('Y-m-d', $validatedData['dateDebut'])
    ->setTimeFromTimeString($validatedData['heureDebut']);
$dateFin = Carbon::createFromFormat('Y-m-d', $validatedData['dateFin'])
    ->setTimeFromTimeString($validatedData['heureFin']);

            // Check if end datetime is after start datetime
         

            // Update reservation with validated data
            $reservation->update([
                 'dateDebut' => $dateDebut->toDateString(),
    'dateFin' => $dateFin->toDateString(),
    'heureDebut' => $dateDebut->format('H:i'),
    'heureFin' => $dateFin->format('H:i'),
    'num_tel' => $validatedData['num_tel'] ?? $reservation->num_tel,
    'nbPersonnes' => $validatedData['nbPersonnes'] ?? $reservation->nbPersonnes,
    'description' => $validatedData['description'] ?? $reservation->description,
            ]);

            // Fetch activity details for notification
            $activite = ActivitePayant::findOrFail($reservation->id_Act);

            // Send notification
            try {
                $userResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/user/users/' . $reservation->user_id);
                if ($userResponse->successful()) {
                    $userData = $userResponse->json();

                    Http::post(
                        env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendEntreprise',
                        [
                            'type' => 'reservation_modified',
                            'target_type' => 'entreprise',
                            'target_id' => $activite->entreprise_id,
                            'data' => [
                                'reservation_id' => $reservation->id_Res,
                                'activity_name' => $activite->nomActP,
                                'user_name' => $userData['first_name'] . ' ' . $userData['last_name'],
                                'dateDebut' => $dateDebut->format('Y-m-d'),
                                'dateFin' => $dateFin->format('Y-m-d'),
                            ]
                        ]
                    );
                }
            } catch (\Exception $e) {
                Log::warning('Failed to send notification:', ['error' => $e->getMessage()]);
            }

            return response()->json([
                'message' => 'Réservation mise à jour avec succès',
                'reservation' => $reservation
            ]);
        } catch (\Exception $e) {
            Log::error('Update reservation error:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de la réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    //v2.0
    // public function update(Request $request, $id_Res)
    // {
    //     try {
    //         // Get the existing reservation
    //         $reservation = Reservation::findOrFail($id_Res);

    //         // Check if reservation can be modified
    //         if ($reservation->etat !== 'en attente') {
    //             return response()->json([
    //                 'message' => 'La réservation ne peut être modifiée que si elle est en attente',
    //             ], 403);
    //         }

    //         // Validate request data
    //         $validatedData = $request->validate([
    //             'dateDebut' => 'date',
    //             'dateFin' => 'date|after:dateDebut',
    //             'num_tel' => 'string|max:15',
    //             'nbPersonnes' => 'nullable|integer|min:1',
    //             'description' => 'nullable|string',
    //         ]);

    //         // Update reservation
    //         $reservation->update($validatedData);

    //         // Fetch activity details
    //         $activite = ActivitePayant::findOrFail($reservation->id_Act);

    //         // Fetch user details
    //         $userResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/user/users/' . $reservation->user_id);
    //         if (!$userResponse->successful()) {
    //             Log::error('Failed to fetch user details', ['response' => $userResponse->json()]);
    //             throw new \Exception('Failed to fetch user details');
    //         }
    //         $userData = $userResponse->json();

    //         // Send notification to enterprise
    //         Http::post(
    //             env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendEntreprise',
    //             [
    //                 'type' => 'reservation_modified',
    //                 'target_type' => 'entreprise',
    //                 'target_id' => $activite->entreprise_id,
    //                 'data' => [
    //                     'reservation_id' => $reservation->id_Res,
    //                     'activity_name' => $activite->nomActP,
    //                     'user_name' => $userData['first_name'] . ' ' . $userData['last_name'],
    //                     'dateDebut' => $reservation->dateDebut,
    //                     'changes' => $validatedData
    //                 ]
    //             ]
    //         );

    //         return response()->json([
    //             'message' => 'Réservation mise à jour avec succès',
    //             'reservation' => $reservation
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Update reservation error:', ['error' => $e->getMessage()]);
    //         return response()->json([
    //             'message' => 'Erreur lors de la mise à jour de la réservation',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }
    /**
     * Supprime une réservation.
     */

    //v3.0
    public function destroy($id_Res)
    {
        try {
            $reservation = Reservation::with('activitePayant')->findOrFail($id_Res);

            // Check if reservation can be cancelled
            if ($reservation->etat !== 'en attente') {
                return response()->json([
                    'message' => 'La réservation ne peut être annulée que si elle est en attente'
                ], 403);
            }

            // Fetch user details
            $userResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/user/users/' . $reservation->user_id);
            if (!$userResponse->successful()) {
                Log::error('Failed to fetch user details', ['response' => $userResponse->json()]);
                throw new \Exception('Failed to fetch user details');
            }
            $userData = $userResponse->json();

            // Send cancellation notification to enterprise
            Http::post(
                env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendEntreprise',
                [
                    'type' => 'reservation_cancelled',
                    'target_type' => 'entreprise',
                    'target_id' => $reservation->activitePayant->entreprise_id,
                    'data' => [
                        'reservation_id' => $reservation->id_Res,
                        'activity_name' => $reservation->activitePayant->nomActP,
                        'user_name' => $userData['first_name'] . ' ' . $userData['last_name'],
                        'dateDebut' => $reservation->dateDebut,
                        'reason' => 'Annulée par l\'utilisateur'
                    ]
                ]
            );

            // Remove from cart
            PanierItem::where('reservation_id', $id_Res)->delete();

            // Delete reservation
            $reservation->delete();

            return response()->json([
                'message' => 'Réservation annulée avec succès'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Delete reservation error:', ['error' => $e->getMessage()]);
            return response()->json([
                'message' => 'Erreur lors de l\'annulation de la réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    //admin functions
    //v3.0
    public function getAllForAdmin()
    {
        try {
            Log::info('Starting getAllForAdmin');

            $reservations = Reservation::with([
                'activitePayant' => function ($query) {
                    $query->select('idActP', 'nomActP');
                }
            ])->get();

            Log::info('Reservations retrieved:', ['data' => $reservations->toArray()]);

            foreach ($reservations as $reservation) {
                try {
                    $authServiceUrl = env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . "/api/user/users/{$reservation->user_id}";
                    $response = Http::get($authServiceUrl);

                    if ($response->successful()) {
                        $userData = $response->json();
                        $userData['name'] = $userData['first_name'] . ' ' . $userData['last_name'];
                        $reservation->user = $userData;
                    }
                } catch (\Exception $e) {
                    Log::error("Error fetching user data: " . $e->getMessage());
                }
            }

            return response()->json([
                'status' => 'success',
                'reservations' => $reservations
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getAllForAdmin:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    //entreprise functions1

    //v2.0
    public function getEnterpriseReservations(Request $request)
    {
        try {
            $entrepriseId = $request->user_data['user']['id'];

            $reservations = Reservation::with([
                'activitePayant:idActP,nomActP'
            ])
                ->where('entreprise_id', $entrepriseId)
                ->get();

            foreach ($reservations as $reservation) {
                try {
                    $authServiceUrl = env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . "/api/user/users/{$reservation->user_id}";
                    $response = Http::get($authServiceUrl);

                    if ($response->successful()) {
                        $userData = $response->json();
                        $userData['name'] = $userData['first_name'] . ' ' . $userData['last_name'];
                        $reservation->user = $userData;
                    }
                } catch (\Exception $e) {
                    Log::error("Error fetching user data: " . $e->getMessage());
                }
            }

            return response()->json([
                'status' => 'success',
                'reservations' => $reservations
            ]);
        } catch (\Exception $e) {
            Log::error('Enterprise reservations error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to load reservations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'etat' => 'required|in:accepte,refuse',
            ]);

            $reservation = Reservation::findOrFail($id);
            $reservation->update(['etat' => $request->etat]);

            // Fetch user details
            $userResponse = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/user/users/' . $reservation->user_id);

            if (!$userResponse->successful()) {
                Log::error('Failed to fetch user details', ['response' => $userResponse->json()]);
                return response()->json(['message' => 'Erreur lors de la récupération des données utilisateur'], 500);
            }

            $userData = $userResponse->json();

            // Send notification with complete user data
            $notificationResponse = Http::post(
                env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendToUser',
                [
                    'type' => 'reservation_status_changed',
                    'target_type' => 'user',
                    'target_id' => $reservation->user_id,
                    'data' => [
                        'reservation_id' => $reservation->id_Res,
                        'activity_name' => $reservation->activitePayant->nomActP,
                        'etat' => $request->etat,
                        'dateDebut' => $reservation->dateDebut,
                        'user_name' => $userData['first_name'] . ' ' . $userData['last_name'],
                        'user_email' => $userData['email']
                    ]
                ]
            );

            if (!$notificationResponse->successful()) {
                Log::warning('Failed to send status update notification', [
                    'response' => $notificationResponse->json()
                ]);
            }

            return response()->json([
                'message' => 'Status updated successfully',
                'reservation' => $reservation,
            ]);
        } catch (\Exception $e) {
            Log::error('Status update error:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Récupère l'historique des réservations payées d'un utilisateur.
     */
    //v2.0
    public function getPaymentHistory(Request $request)
    {
        try {
            // Vérifier l'utilisateur
            $userData = $request->get('user_data');
            if (!isset($userData['user']['id'])) {
                return response()->json(['message' => 'Utilisateur non authentifié'], 401);
            }

            // Récupérer les réservations avec les relations
            $reservations = Reservation::with(['activitePayant.images'])
                ->where('user_id', $userData['user']['id'])
                ->where('payment_status', 'payée')
                ->get()
                ->map(function ($reservation) {
                    return [
                        'id_Res' => $reservation->id_Res,
                        'activite' => $reservation->activitePayant->nomActP,
                        'dateDebut' => $reservation->dateDebut,
                        'dateFin' => $reservation->dateFin,
                        'montant' => $reservation->montant,
                        'etat' => $reservation->etat,
                        'images' => $reservation->activitePayant->images->map(function ($image) {
                            return [
                                'id' => $image->id,
                                'url' => $image->url,
                                'full_url' => url('/storage/' . $image->url)
                            ];
                        })
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Historique des réservations récupéré avec succès',
                'reservations' => $reservations
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur récupération historique réservations:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'historique des réservations',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    //v1.0
    // public function getPaymentHistory(Request $request)
    // {
    //     try {
    //         $userData = $request->get('user_data');
    //         if (!isset($userData['user']['id'])) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Utilisateur non authentifié'
    //             ], 401);
    //         }

    //         $reservations = Reservation::with(['activitePayant:idActP,nomActP'])
    //             ->where('user_id', $userData['user']['id'])
    //             ->where('payment_status', 'payée')
    //             ->orderBy('dateCreationReservation', 'desc')
    //             ->get()
    //             ->map(function ($reservation) {
    //                 return [
    //                     'id' => $reservation->id_Res,
    //                     'activite' => $reservation->activitePayant->nomActP,
    //                     'dateCreation' => $reservation->dateCreationReservation,
    //                     'dateDebut' => $reservation->dateDebut,
    //                     'dateFin' => $reservation->dateFin,
    //                     'heureDebut' => $reservation->heureDebut,
    //                     'heureFin' => $reservation->heureFin,
    //                     'montant' => $reservation->montant,
    //                     'nombreSeances' => $reservation->nombreSeances,
    //                     'status' => $reservation->etat
    //                 ];
    //             });

    //         return response()->json([
    //             'success' => true,
    //             'message' => 'Historique des réservations récupéré avec succès',
    //             'reservations' => $reservations
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Erreur récupération historique réservations:', [
    //             'error' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);

    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Erreur lors de la récupération de l\'historique des réservations',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }
}
