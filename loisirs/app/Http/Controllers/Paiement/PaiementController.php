<?php

namespace App\Http\Controllers\Paiement;

use App\Http\Controllers\Controller;
use App\Models\Paiement;
use App\Models\Reservation;
use App\Models\Panier;
use App\Models\PanierItem;
use App\Models\Publicite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaiementController extends Controller
{
    /**
     * Initialise un paiement via Flouci
     */
    //v8.0
    public function initiatePayment(Request $request, $reservationId)
    {
        try {
            Log::info('Starting payment initiation for reservation:', ['reservation_id' => $reservationId]);

            // Récupérer la réservation avec l'activité
            $reservation = Reservation::with(['activitePayant'])
                ->findOrFail($reservationId);

            if ($reservation->etat !== 'accepte') {
                return response()->json([
                    'message' => 'La réservation doit être acceptée avant de procéder au paiement',
                    'status' => 'error'
                ], 400);
            }

            if (!$reservation->activitePayant) {
                throw new \Exception('Activité payante non trouvée');
            }

            // Récupérer l'entreprise
            $entrepriseId = $reservation->activitePayant->entreprise_id;
            $response = Http::withHeaders([
                'Accept' => 'application/json'
            ])->get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $entrepriseId);

            if (!$response->successful()) {
                throw new \Exception('Impossible de récupérer les informations de l\'entreprise');
            }

            $data = $response->json();
            if (!isset($data['entreprise'])) {
                throw new \Exception('Format de réponse invalide');
            }

            $entreprise = $data['entreprise'];

            if (empty($entreprise['flouci_public_key']) || empty($entreprise['flouci_secret_key'])) {
                return response()->json([
                    'message' => 'Cette entreprise n\'a pas configuré son système de paiement'
                ], 400);
            }

            // Préparer les données pour Flouci
            $paymentData = [
                'app_token' => $entreprise['flouci_public_key'],
                'app_secret' => $entreprise['flouci_secret_key'],
                'amount' => $reservation->montant * 1000,
                'accept_card' => "true",
                'session_timeout_secs' => 1200,
                'success_link' => route('payment.success', [], true),
                'fail_link' => route('payment.failure', [], true),
                'developer_tracking_id' => $entreprise['flouci_developer_id'] ?? null
            ];

            Log::info('Sending request to Flouci:', ['payment_data' => $paymentData]);

            $flouciResponse = Http::withHeaders([
                'Content-Type' => 'application/json'
            ])->post('https://developers.flouci.com/api/generate_payment', $paymentData);

            if (!$flouciResponse->successful()) {
                Log::error('Flouci API error:', [
                    'status' => $flouciResponse->status(),
                    'body' => $flouciResponse->json()
                ]);
                throw new \Exception('Erreur lors de l\'initialisation du paiement Flouci: ' . $flouciResponse->body());
            }

            $result = $flouciResponse->json();

            // Créer l'enregistrement de paiement
            $paiement = Paiement::create([
                'user_id' => $request->user_data['user']['id'],
                'entreprise_id' => $entrepriseId,
                'reservation_id' => $reservationId,
                'montant' => $reservation->montant,
                'statut' => 'en_attente',
                'transaction_id' => $result['result']['payment_id'],
                'methode_paiement' => 'flouci'
            ]);

            Log::info('Payment initiated successfully', [
                'payment_id' => $paiement->id,
                'transaction_id' => $result['result']['payment_id']
            ]);

            return response()->json([
                'payment_url' => $result['result']['link'],
                'payment_id' => $result['result']['payment_id']
            ]);
        } catch (\Exception $e) {
            Log::error('Payment initiation error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erreur lors de l\'initiation du paiement',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    //v7.0
    //     public function initiatePayment(Request $request, $reservationId)  // Ajout du paramètre $reservationId
    // {
    //     try {
    //         // Récupérer la réservation avec l'activité
    //         $reservation = Reservation::with(['activitePayant'])
    //             ->findOrFail($reservationId);

    //         if ($reservation->etat !== 'accepte') {
    //             return response()->json([
    //                 'message' => 'La réservation doit être acceptée avant de procéder au paiement'
    //             ], 400);
    //         }

    //         // Vérifier l'entreprise
    //         $entrepriseId = $reservation->activitePayant->entreprise_id;
    //         $response = Http::get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $entrepriseId);

    //         if (!$response->successful()) {
    //             throw new \Exception('Impossible de récupérer les informations de l\'entreprise');
    //         }

    //         $entreprise = $response->json()['entreprise'];

    //         if (empty($entreprise['flouci_public_key']) || empty($entreprise['flouci_secret_key'])) {
    //             return response()->json([
    //                 'message' => 'Configuration de paiement non disponible'
    //             ], 400);
    //         }

    //         // Données pour Flouci
    //         $paymentData = [
    //             'app_token' => $entreprise['flouci_public_key'],
    //             'app_secret' => $entreprise['flouci_secret_key'],
    //             'amount' => $reservation->montant * 1000,
    //             'accept_card' => "true",
    //             'success_link' => route('payment.success'),
    //             'fail_link' => route('payment.failure')
    //         ];

    //         $flouciResponse = Http::post('https://developers.flouci.com/api/generate_payment', $paymentData);

    //         if (!$flouciResponse->successful()) {
    //             throw new \Exception('Erreur Flouci');
    //         }

    //         $result = $flouciResponse->json();

    //         // Créer paiement
    //         Paiement::create([
    //             'user_id' => $request->user_data['user']['id'],
    //             'entreprise_id' => $entrepriseId,
    //             'reservation_id' => $reservationId,
    //             'montant' => $reservation->montant,
    //             'statut' => 'en_attente',
    //             'transaction_id' => $result['result']['payment_id'],
    //             'methode_paiement' => 'flouci'
    //         ]);

    //         return response()->json([
    //             'payment_url' => $result['result']['link'],
    //             'payment_id' => $result['result']['payment_id']
    //         ]);

    //     } catch (\Exception $e) {
    //         Log::error('Payment error:', [
    //             'message' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);
    //         return response()->json([
    //             'message' => 'Erreur lors de l\'initiation du paiement',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }
    //v6.0
    // public function initiatePayment(Request $request)
    // {
    //     try {
    //         $reservationId = $request->input('reservation_id');

    //         // Récupérer la réservation avec l'activité
    //         $reservation = Reservation::with(['activitePayant'])
    //             ->findOrFail($reservationId);

    //         if ($reservation->etat !== 'accepte') {
    //             return response()->json([
    //                 'message' => 'La réservation doit être acceptée avant de procéder au paiement',
    //                 'status' => 'error'
    //             ], 400);
    //         }
    //         if (!$reservation->activitePayant) {
    //             throw new \Exception('Activité payante non trouvée');
    //         }

    //         $entrepriseId = $reservation->activitePayant->entreprise_id;

    //         // Appel au service d'auth
    //         $response = Http::withHeaders([
    //             'Accept' => 'application/json'
    //         ])->get(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $entrepriseId);

    //         if (!$response->successful()) {
    //             throw new \Exception('Impossible de récupérer les informations de l\'entreprise');
    //         }

    //         $data = $response->json();

    //         if (!isset($data['entreprise'])) {
    //             throw new \Exception('Format de réponse invalide');
    //         }

    //         $entreprise = $data['entreprise'];

    //         if (empty($entreprise['flouci_public_key']) || empty($entreprise['flouci_secret_key'])) {
    //             return response()->json([
    //                 'message' => 'Cette entreprise n\'a pas configuré son système de paiement'
    //             ], 400);
    //         }

    //         // Préparer les données pour Flouci
    //         $paymentData = [
    //             'app_token' => $entreprise['flouci_public_key'],
    //             'app_secret' => $entreprise['flouci_secret_key'],
    //             'amount' => $reservation->montant * 1000,
    //             'accept_card' => "true",
    //             'session_timeout_secs' => 1200,
    //             'success_link' => route('payment.success', [], true),
    //             'fail_link' => route('payment.failure', [], true),
    //             'developer_tracking_id' => $entreprise['flouci_developer_id']
    //         ];

    //         $flouciResponse = Http::withHeaders([
    //             'Content-Type' => 'application/json'
    //         ])->post('https://developers.flouci.com/api/generate_payment', $paymentData);

    //         if (!$flouciResponse->successful()) {
    //             throw new \Exception('Erreur lors de l\'initialisation du paiement Flouci');
    //         }

    //         $result = $flouciResponse->json();

    //         // Créer l'enregistrement de paiement
    //         Paiement::create([
    //             'user_id' => $request->get('user_data')['user']['id'],
    //             'entreprise_id' => $entrepriseId,
    //             'reservation_id' => $reservationId,
    //             'montant' => $reservation->montant,
    //             'statut' => 'en_attente',
    //             'transaction_id' => $result['result']['payment_id'],
    //             'methode_paiement' => 'flouci'
    //         ]);

    //         return response()->json([
    //             'payment_url' => $result['result']['link'],
    //             'payment_id' => $result['result']['payment_id']
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Payment error:', [
    //             'message' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);
    //         return response()->json([
    //             'message' => 'Erreur serveur',
    //             'debug_message' => $e->getMessage()
    //         ], 500);
    //     }
    // }
    //v3.0
    public function verifyPayment($paymentId)
    {
        try {
            // Récupérer le paiement avec ses relations
            $paiement = Paiement::where('transaction_id', $paymentId)
                ->with(['reservation.activitePayant'])
                ->firstOrFail();

            // Récupérer les infos de l'entreprise depuis le service d'auth
            $entrepriseResponse = Http::get(
                env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $paiement->entreprise_id
            );

            if (!$entrepriseResponse->successful()) {
                throw new \Exception('Impossible de récupérer les informations de l\'entreprise');
            }

            $entreprise = $entrepriseResponse->json()['entreprise'];

            // Vérifier le paiement avec les credentials de l'entreprise
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'apppublic' => decrypt($entreprise['flouci_public_key']),
                'appsecret' => decrypt($entreprise['flouci_secret_key']),
            ])->get("https://developers.flouci.com/api/verify_payment/{$paymentId}");

            if (!$response->successful()) {
                throw new \Exception('Échec de la vérification du paiement');
            }

            $result = $response->json();

            if ($result['success'] && $result['result']['status'] === 'SUCCESS') {
                // Mise à jour des statuts
                $paiement->update(['statut' => 'reussi']);

                if ($paiement->reservation_id) {
                    $paiement->reservation->update([
                        'payment_status' => 'payée',
                        'etat' => 'accepte'
                    ]);

                    // Supprimer du panier
                    PanierItem::where('reservation_id', $paiement->reservation_id)->delete();
                }

                return response()->json([
                    'status' => 'success',
                    'message' => 'Paiement vérifié avec succès'
                ]);
            } else {
                // Mise à jour des statuts en cas d'échec
                $paiement->update(['statut' => 'echoue']);

                if ($paiement->reservation_id) {
                    $paiement->reservation->update([
                        'payment_status' => 'rejected',
                        'etat' => 'refuse'
                    ]);
                }

                return response()->json([
                    'status' => 'failed',
                    'message' => 'Échec du paiement'
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Erreur vérification paiement:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }
    //v2.0 failure 
    // public function handleFailure(Request $request)
    // {
    //     try {
    //         $paymentId = $request->query('payment_id');
    //         if ($paymentId) {
    //             $paiement = Paiement::where('transaction_id', $paymentId)->first();
    //             if ($paiement) {
    //                 $paiement->update(['statut' => 'echoue']);

    //                 //v2.0
    //                 if ($paiement->reservation_id) {
    //                     $paiement->reservation->update([
    //                         'payment_status' => 'rejected',
    //                         'etat' => 'refuse'
    //                     ]);

    //                     // Mettre à jour le statut dans le panier
    //                     PanierItem::where('reservation_id', $paiement->reservation_id)
    //                         ->update(['statut' => 'expire']);
    //                     // Notifier uniquement l'utilisateur
    //                     $notificationData = [
    //                         'montant' => $paiement->montant,
    //                         'transaction_id' => $paymentId,
    //                         'date' => now()->format('Y-m-d H:i:s'),
    //                         'user_id' => $paiement->user_id,
    //                         'user_nom' => $paiement->user->nom, // Ajouter le nom de l'utilisateur
    //                         'reservation_id' => $paiement->reservation_id
    //                     ];

    //                     Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendToUser', [
    //                         'type' => 'reservation_payment_failed',
    //                         'target_type' => 'user',
    //                         'target_id' => $paiement->user_id,
    //                         'data' => $notificationData
    //                     ]);
    //                 }
    //                 //v1.0
    //                 // if ($paiement->reservation_id) {
    //                 //     $reservation = $paiement->reservation;
    //                 //     $reservation->update([
    //                 //         'payment_status' => 'rejected',
    //                 //     ]);
    //                 //     $panierItem = PanierItem::where('reservation_id', $reservation->id_Res)->first();
    //                 //     if ($panierItem) {
    //                 //         $panierItem->update(['statut' => 'expire']);
    //                 //     }
    //                 // }
    //                 // Si c'est une publicité
    //                 if ($paiement->publicite_id) {
    //                     $publicite = $paiement->publicite;
    //                     if ($publicite) {
    //                         $publicite->update([
    //                             'payment_status' => 'failed',
    //                         ]);
    //                     }
    //                 }
    //             }
    //         }
    //         return view('payment.failure');
    //     } catch (\Exception $e) {
    //         Log::error('Payment failure error: ' . $e->getMessage());
    //         return view('payment.failure');
    //     }
    // }
    public function verifyReservationPayment($paymentId)
    {
        try {
            Log::info('Verifying reservation payment', ['payment_id' => $paymentId]);

            $paiement = Paiement::with(['reservation'])
                ->where('transaction_id', $paymentId)
                ->where('reservation_id', '!=', null)
                ->first();

            if (!$paiement) {
                return response()->json(['success' => false, 'message' => 'Paiement non trouvé']);
            }

            // Récupérer les credentials de l'entreprise
            $entrepriseResponse = Http::get(
                env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/entreprise/entreprises/' . $paiement->entreprise_id
            );

            if (!$entrepriseResponse->successful()) {
                return response()->json(['success' => false, 'message' => 'Erreur récupération données entreprise']);
            }

            $entreprise = $entrepriseResponse->json()['entreprise'];

            // Vérification avec Flouci
            $verificationResponse = Http::withHeaders([
                'Content-Type' => 'application/json',
                'apppublic' => $entreprise['flouci_public_key'],
                'appsecret' => $entreprise['flouci_secret_key'],
            ])->get("https://developers.flouci.com/api/verify_payment/{$paymentId}");

            if ($verificationResponse->successful() && $verificationResponse->json()['success']) {
                DB::beginTransaction();
                try {
                    $paiement->update(['statut' => 'reussi']);

                    $paiement->reservation->update([
                        'payment_status' => 'payée',

                    ]);

                    // Supprimer du panier
                    $panierItem = PanierItem::where('reservation_id', $paiement->reservation_id)->first();
                    if ($panierItem) {
                        $panierItem->delete();

                        $panier = Panier::find($panierItem->panier_id);
                        if ($panier) {
                            $panier->total_amount = $panier->items->sum('prix');
                            $panier->save();
                        }
                    }

                    DB::commit();
                    return response()->json(['success' => true, 'message' => 'Paiement vérifié avec succès']);
                } catch (\Exception $e) {
                    DB::rollBack();
                    throw $e;
                }
            }

            return response()->json(['success' => false, 'message' => 'Échec de la vérification']);
        } catch (\Exception $e) {
            Log::error('Verification error:', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Erreur de vérification']);
        }
    }

    // public function verifyPublicitePayment($paymentId)
    // {
    //     try {
    //         Log::info('Verifying publicite payment', ['payment_id' => $paymentId]);

    //         $paiement = Paiement::with(['publicite'])
    //             ->where('transaction_id', $paymentId)
    //             ->where('publicite_id', '!=', null)
    //             ->first();

    //         if (!$paiement) {
    //             return response()->json(['success' => false, 'message' => 'Paiement non trouvé']);
    //         }

    //         // Vérification avec credentials admin
    //         $verificationResponse = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //             'apppublic' => config('services.flouci.token'),
    //             'appsecret' => config('services.flouci.secret')
    //         ])->get("https://developers.flouci.com/api/verify_payment/{$paymentId}");

    //         if ($verificationResponse->successful() && $verificationResponse->json()['success']) {
    //             DB::beginTransaction();
    //             try {
    //                 $paiement->update(['statut' => 'reussi']);

    //                 $paiement->publicite->update([
    //                     'payment_status' => 'paid',
    //                     'statut' => 'active',
    //                     'date_debut' => now(),
    //                     'date_fin' => now()->addDays($paiement->publicite->nbJours)
    //                 ]);

    //                 DB::commit();
    //                 return response()->json(['success' => true, 'message' => 'Paiement vérifié avec succès']);
    //             } catch (\Exception $e) {
    //                 DB::rollBack();
    //                 throw $e;
    //             }
    //         }

    //         return response()->json(['success' => false, 'message' => 'Échec de la vérification']);
    //     } catch (\Exception $e) {
    //         Log::error('Verification error:', ['error' => $e->getMessage()]);
    //         return response()->json(['success' => false, 'message' => 'Erreur de vérification']);
    //     }
    // }

    //v2.0
    public function handleSuccess(Request $request)
    {
        try {
            Log::info('Payment success callback started', [
                'request_params' => $request->all(),
                'payment_id' => $request->query('payment_id')
            ]);

            $paymentId = $request->query('payment_id');
            if (!$paymentId) {
                Log::error('Payment ID missing in request');
                throw new \Exception('Payment ID missing');
            }

            $paiement = Paiement::with(['reservation', 'publicite'])
                ->where('transaction_id', $paymentId)
                ->first();

            if (!$paiement) {
                Log::error('Payment not found', ['payment_id' => $paymentId]);
                throw new \Exception('Payment not found');
            }

            Log::info('Payment found', [
                'payment_details' => $paiement->toArray(),
                'has_reservation' => (bool)$paiement->reservation_id
            ]);

            // Vérifier selon le type de paiement
            if ($paiement->reservation_id) {
                $verificationResult = $this->verifyReservationPayment($paymentId);
                Log::info('Verification result', [
                    'success' => $verificationResult->getData()->success,
                    'message' => $verificationResult->getData()->message ?? null
                ]);

                if ($verificationResult->getData()->success) {
                    try {
                        // Récupérer les informations de l'utilisateur
                        $userResponse = Http::get(
                            env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') .
                                '/api/user/users/' . $paiement->user_id
                        );

                        Log::info('User API response', [
                            'status' => $userResponse->status(),
                            'body' => $userResponse->json()
                        ]);

                        if ($userResponse->successful()) {
                            $userData = $userResponse->json(); // Les données sont directement accessibles

                            $notificationData = [
                                'montant' => $paiement->montant,
                                'transaction_id' => $paymentId,
                                'date' => now()->format('Y-m-d H:i:s'),
                                'reservation_id' => $paiement->reservation_id,
                                'user_id' => $paiement->user_id,
                                'user_nom' => $userData['first_name'] . ' ' . $userData['last_name'], // Accès direct aux données
                                'entreprise_id' => $paiement->entreprise_id
                            ];

                            Log::info('Sending notifications', ['notification_data' => $notificationData]);

                            // Envoyer notification à l'entreprise
                            $entrepriseNotifResponse = Http::post(
                                env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendEntreprise',
                                [
                                    'type' => 'reservation_payment_success',
                                    'target_type' => 'entreprise',
                                    'target_id' => $paiement->entreprise_id,
                                    'data' => $notificationData
                                ]
                            );

                            Log::info('Enterprise notification response', [
                                'status' => $entrepriseNotifResponse->status(),
                                'body' => $entrepriseNotifResponse->json()
                            ]);

                            // Envoyer notification à l'utilisateur
                            $userNotifResponse = Http::post(
                                env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendToUser',
                                [
                                    'type' => 'reservation_payment_success',
                                    'target_type' => 'user',
                                    'target_id' => $paiement->user_id,
                                    'data' => $notificationData
                                ]
                            );

                            Log::info('User notification response', [
                                'status' => $userNotifResponse->status(),
                                'body' => $userNotifResponse->json()
                            ]);
                        }

                        Log::info('Payment process completed successfully');
                        return redirect('http://localhost:3000/enterprise/payment/success')
                            ->with('success', 'Paiement de la réservation effectué avec succès');
                    } catch (\Exception $e) {
                        Log::error('Notification error', [
                            'message' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                        // Continuer avec la redirection même si les notifications échouent
                        return redirect('http://localhost:3000/enterprise/payment/success');
                    }
                }
            }

            Log::error('Payment verification failed');
            throw new \Exception('Payment verification failed');
        } catch (\Exception $e) {
            Log::error('Payment success handler error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect('http://localhost:3000/enterprise/payment/fail')
                ->with('error', 'Une erreur est survenue lors du traitement du paiement');

            // return redirect('http://localhost:3000/payment/fail')
            //     ->with('error', 'Une erreur est survenue lors du traitement du paiement');
        }
    }
    //v2.0
    public function handleFailure(Request $request)
    {
        try {
            Log::info('Payment failure callback started', [
                'request_params' => $request->all(),
                'payment_id' => $request->query('payment_id')
            ]);

            $paymentId = $request->query('payment_id');
            if (!$paymentId) {
                Log::error('Payment ID missing in failure callback');
                throw new \Exception('Payment ID missing');
            }

            $paiement = Paiement::with(['reservation'])
                ->where('transaction_id', $paymentId)
                ->first();

            if (!$paiement) {
                Log::error('Payment not found', ['payment_id' => $paymentId]);
                throw new \Exception('Payment not found');
            }

            Log::info('Payment found', [
                'payment_details' => $paiement->toArray(),
                'has_reservation' => (bool)$paiement->reservation_id
            ]);

            DB::beginTransaction();
            try {
                // Mettre à jour le statut du paiement
                $paiement->update(['statut' => 'echoue']);
                Log::info('Payment status updated to failed', ['payment_id' => $paymentId]);

                // Mettre à jour le statut de la réservation si applicable
                if ($paiement->reservation_id) {
                    $paiement->reservation->update([
                        'payment_status' => 'rejected',

                    ]);
                    Log::info('Reservation status updated', [
                        'reservation_id' => $paiement->reservation_id,
                    ]);

                    // Récupérer les informations de l'utilisateur
                    $userResponse = Http::get(
                        env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') .
                            '/api/user/users/' . $paiement->user_id
                    );

                    Log::info('User API response', [
                        'status' => $userResponse->status(),
                        'body' => $userResponse->json()
                    ]);

                    if ($userResponse->successful()) {
                        $userData = $userResponse->json();

                        $notificationData = [
                            'montant' => $paiement->montant,
                            'transaction_id' => $paymentId,
                            'date' => now()->format('Y-m-d H:i:s'),
                            'user_id' => $paiement->user_id,
                            'user_nom' => $userData['first_name'] . ' ' . $userData['last_name'],
                            'reservation_id' => $paiement->reservation_id
                        ];

                        Log::info('Sending failure notification', ['notification_data' => $notificationData]);

                        // Envoyer notification uniquement à l'utilisateur
                        $notificationResponse = Http::post(
                            env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendToUser',
                            [
                                'type' => 'reservation_payment_failed',
                                'target_type' => 'user',
                                'target_id' => $paiement->user_id,
                                'data' => $notificationData
                            ]
                        );

                        Log::info('Notification response', [
                            'status' => $notificationResponse->status(),
                            'body' => $notificationResponse->json()
                        ]);
                    }
                }

                DB::commit();
                Log::info('Payment failure process completed successfully');

                return redirect('http://localhost:3000/enterprise/payment/fail')
                    ->with('error', 'Le paiement a échoué. Veuillez réessayer.');
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Transaction error in failure handler:', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Payment failure handler error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect('http://localhost:3000/enterprise/payment/fail')
                ->with('error', 'Une erreur est survenue lors du traitement de l\'échec du paiement');
        }
    }
    //v1,0
    // public function handleFailure(Request $request)
    // {
    //     try {
    //         Log::info('Payment failure callback started', [
    //             'request_params' => $request->all(),
    //             'payment_id' => $request->query('payment_id')
    //         ]);

    //         $paymentId = $request->query('payment_id');
    //         if (!$paymentId) {
    //             Log::error('Payment ID missing in request');
    //             throw new \Exception('Payment ID missing');
    //         }

    //         $paiement = Paiement::with(['reservation'])
    //             ->where('transaction_id', $paymentId)
    //             ->first();

    //         if (!$paiement) {
    //             Log::error('Payment not found', ['payment_id' => $paymentId]);
    //             throw new \Exception('Payment not found');
    //         }

    //         Log::info('Payment found', [
    //             'payment_details' => $paiement->toArray(),
    //             'has_reservation' => (bool)$paiement->reservation_id
    //         ]);

    //         // Mettre à jour le statut du paiement
    //         $paiement->update(['statut' => 'echoue']);

    //         // Mettre à jour le statut de la réservation si applicable
    //         if ($paiement->reservation_id) {
    //             $paiement->reservation->update([
    //                 'payment_status' => 'rejected',
    //             ]);
    //         }

    //         // Récupérer les informations de l'utilisateur
    //         $userResponse = Http::get(
    //             env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') .
    //                 '/api/user/users/' . $paiement->user_id
    //         );

    //         Log::info('User API response', [
    //             'status' => $userResponse->status(),
    //             'body' => $userResponse->json()
    //         ]);

    //         if ($userResponse->successful()) {
    //             $userData = $userResponse->json();

    //             $notificationData = [
    //                 'montant' => $paiement->montant,
    //                 'transaction_id' => $paymentId,
    //                 'date' => now()->format('Y-m-d H:i:s'),
    //                 'reservation_id' => $paiement->reservation_id,
    //                 'user_id' => $paiement->user_id,
    //             ];

    //             Log::info('Sending failure notification to user', ['notification_data' => $notificationData]);

    //             // Envoyer notification à l'utilisateur
    //             $userNotifResponse = Http::post(
    //                 env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendToUser',
    //                 [
    //                     'type' => 'reservation_payment_failed',
    //                     'target_type' => 'user',
    //                     'target_id' => $paiement->user_id,
    //                     'data' => $notificationData
    //                 ]
    //             );

    //             Log::info('User failure notification response', [
    //                 'status' => $userNotifResponse->status(),
    //                 'body' => $userNotifResponse->json()
    //             ]);
    //         }

    //         Log::info('Payment failure process completed successfully');
    //         return redirect('http://localhost:3000/enterprise/payment/fail')
    //             ->with('error', 'Le paiement a échoué. Veuillez réessayer.');
    //     } catch (\Exception $e) {
    //         Log::error('Payment failure handler error:', [
    //             'message' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);

    //         return redirect('http://localhost:3000/enterprise/payment/fail')
    //             ->with('error', 'Une erreur est survenue lors du traitement de l\'échec du paiement.');
    //     }
    // }
    //v1.0
    // public function handleSuccess(Request $request)
    // {
    //     try {
    //         Log::info('Payment callback started', ['params' => $request->all()]);

    //         $paymentId = $request->query('payment_id');
    //         if (!$paymentId) {
    //             throw new \Exception('Payment ID missing');
    //         }

    //         $paiement = Paiement::with(['reservation', 'publicite'])
    //             ->where('transaction_id', $paymentId)
    //             ->first();

    //         if (!$paiement) {
    //             throw new \Exception('Payment not found');
    //         }


    //         // Vérifier selon le type de paiement
    //         if ($paiement->reservation_id) {
    //             $verificationResult = $this->verifyReservationPayment($paymentId);
    //             if ($verificationResult->getData()->success) {
    //                 // Préparer les données de notification
    //                 // Préparer les données de notification
    //                 // $userResponse = Http::get(
    //                 //     env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') .
    //                 //         '/api/user/users/' . $paiement->user_id
    //                 // );
    //                 // $userData = $userResponse->json()['user'];
    //                 // $notificationData = [
    //                 //     'montant' => $paiement->montant,
    //                 //     'transaction_id' => $paymentId,
    //                 //     'date' => now()->format('Y-m-d H:i:s'),
    //                 //     'reservation_id' => $paiement->reservation_id,
    //                 //     'user_id' => $paiement->user_id,
    //                 //     'user_nom' => $userData['first_name'] . ' ' . $userData['last_name'], // Utiliser les données de l'API
    //                 //     'entreprise_id' => $paiement->entreprise_id
    //                 // ];

    //                 // // Envoyer les notifications via le service d'auth
    //                 // Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendEntreprise', [
    //                 //     'type' => 'reservation_payment_success',
    //                 //     'target_type' => 'entreprise',
    //                 //     'target_id' => $paiement->entreprise_id,
    //                 //     'data' => $notificationData
    //                 // ]);

    //                 // Http::post(env('AUTH_SERVICE_URL', 'http://127.0.0.1:8001') . '/api/notifications/sendToUser', [
    //                 //     'type' => 'reservation_payment_success',
    //                 //     'target_type' => 'user',
    //                 //     'target_id' => $paiement->user_id,
    //                 //     'data' => $notificationData
    //                 // ]);

    //                 return redirect()->route('payment.reservation.success')
    //                     ->with('success', 'Paiement de la réservation effectué avec succès');
    //             }
    //         }
    //         // else if ($paiement->publicite_id) {
    //         //     return redirect()->route('payment.publicite.success')
    //         //         ->with('success', 'Paiement de la publicité effectué avec succès');
    //         // }

    //         throw new \Exception('Payment verification failed');
    //     } catch (\Exception $e) {
    //         Log::error('Payment success error:', [
    //             'message' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);

    //         return redirect()->route('payment.failure')
    //             ->with('error', 'Une erreur est survenue lors du traitement du paiement');
    //     }
    // }
}
