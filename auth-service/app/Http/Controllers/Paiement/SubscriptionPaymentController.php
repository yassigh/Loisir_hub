<?php

namespace App\Http\Controllers\Paiement;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Subscription;
use App\Models\EntreprisePayment;
use App\Http\Controllers\Notifications\NotificationController;

class SubscriptionPaymentController extends Controller
{
    /**
     * Initialise un paiement pour un abonnement via Flouci.
     */
    public function initiatePayment(Request $request)
    {
        try {
            $entreprise = $request->user();

            // Valider les données d'entrée
            $validated = $request->validate([
                'subscription_id' => 'required|exists:subscriptions,id',
            ]);

            // Récupérer l'abonnement
            $subscription = Subscription::findOrFail($validated['subscription_id']);

            // Vérifier si l'abonnement appartient à l'entreprise connectée
            if ($subscription->entreprise_id !== $entreprise->id) {
                return response()->json(['message' => 'Abonnement non autorisé'], 403);
            }

            // Préparer les données pour Flouci
            $paymentData = [
                'app_token' => config('services.flouci.token'),
                'app_secret' => config('services.flouci.secret'),
                'amount' => $subscription->plan->price * 1000, // Convertir en millimes
                'accept_card' => "true",
                'session_timeout_secs' => 1200, // 20 minutes
                'success_link' => route('payment.success', [], true),
                'fail_link' => route('payment.failure', [], true),
                'developer_tracking_id' => uniqid(), // Générer un ID unique
            ];

            // Appel à l'API Flouci
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->post('https://developers.flouci.com/api/generate_payment', $paymentData);

            if ($response->successful()) {
                $result = $response->json();

                // Créer un enregistrement de paiement
                $payment = EntreprisePayment::create([
                    'entreprise_id' => $entreprise->id,
                    'subscription_id' => $subscription->id,
                    'montant' => $subscription->plan->price,
                    'statut' => 'en_attente',
                    'transaction_id' => $result['result']['payment_id'],
                    'methode_paiement' => 'flouci',
                ]);

                return response()->json([
                    'payment_url' => $result['result']['link'],
                    'payment_id' => $result['result']['payment_id'],
                ]);
            }

            return response()->json(['message' => 'Erreur lors de l\'initialisation du paiement'], 400);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Vérifie le statut d'un paiement d'abonnement.
     */
    public function verifyPayment($paymentId)
    {
        try {
            // Appel à l'API Flouci pour vérifier le statut du paiement
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'apppublic' => config('services.flouci.token'),
                'appsecret' => config('services.flouci.secret'),
            ])->get("https://developers.flouci.com/api/verify_payment/{$paymentId}");

            if (!$response->successful() || !$response->json()['success']) {
                return response()->json(['message' => 'Impossible de vérifier le paiement'], 400);
            }

            $result = $response->json();

            // Recherche du paiement correspondant
            $payment = EntreprisePayment::where('transaction_id', $paymentId)->firstOrFail();
            $subscription = $payment->subscription;

            // Traitement en fonction du statut du paiement
            if ($result['result']['status'] === 'SUCCESS') {
                // Mise à jour des statuts en cas de succès
                $payment->update(['statut' => 'reussi']);
                $subscription->update(['status' => 'active', 'payment_status' => 'completed']);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Paiement confirmé avec succès',
                    'subscription' => $subscription,
                ]);
            } else {
                // Mise à jour des statuts en cas d'échec
                $payment->update(['statut' => 'echoue']);
                $subscription->update(['status' => 'inactive', 'payment_status' => 'failed']);

                return response()->json(['status' => 'failed', 'message' => 'Paiement échoué'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }
    public function handleSuccess(Request $request)
    {
        try {
            $paymentId = $request->query('payment_id');
            if (!$paymentId) {
                return redirect('http://localhost:3000/enterprise/payment/fail');
            }

            // Vérifier le paiement avec Flouci
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'apppublic' => config('services.flouci.token'),
                'appsecret' => config('services.flouci.secret'),
            ])->get("https://developers.flouci.com/api/verify_payment/{$paymentId}");

            if (!$response->successful() || !$response->json()['success']) {
                return redirect('http://localhost:3000/enterprise/payment/fail');
            }

            $result = $response->json();
            $payment = EntreprisePayment::where('transaction_id', $paymentId)->firstOrFail();

            if ($result['result']['status'] === 'SUCCESS') {
                $payment->update(['statut' => 'reussi']);

                $notificationData = [
                    'montant' => $payment->montant,
                    'transaction_id' => $paymentId,
                    'date' => now()->format('Y-m-d H:i:s'),
                    'type' => $payment->type_paiement === 'subscription' ? 'Abonnement' : 'Publicité',
                    'entreprise_id' => $payment->entreprise_id
                ];
    
                // Utiliser NotificationController pour envoyer les notifications
                $notificationController = new NotificationController();
                
                // Notifier les admins
                $notificationController->sendToAdmins(new Request([
                    'type' => 'payment_success',
                    'data' => $notificationData
                ]));
    
                // Notifier l'entreprise
                $notificationController->sendToEntreprises(new Request([
                    'type' => 'payment_success',
                    'target_type' => 'entreprise',
                    'target_id' => $payment->entreprise_id,
                    'data' => $notificationData
                ]));

                if ($payment->type_paiement === 'subscription') {
                    // Mise à jour abonnement
                    $notificationData['type'] = 'Abonnement';
                    $payment->subscription->update([
                        'status' => 'active',
                        'payment_status' => 'completed'
                    ]);
                    return redirect('http://localhost:3000/enterprise/payment/success');
                } else if ($payment->type_paiement === 'publicite') {
                    // Mise à jour publicité via l'API loisirs
                    $response = Http::put(env('LOISIRS_SERVICE_URL', 'http://127.0.0.1:8000') . '/api/publicites/' . $payment->publicite_id . '/payment-status', [
                        'payment_status' => 'paid',
                        'date_debut' => now(),
                        'date_fin' => now()->addDays(30) // Assumant 30 jours comme exemple
                    ]);

                    Log::info('Publicite payment update response:', [
                        'status' => $response->status(),
                        'body' => $response->json()
                    ]);

                    return redirect('http://localhost:3000/enterprise/publicite/payment/success');
                }
            }

            return redirect('http://localhost:3000/enterprise/payment/fail');
        } catch (\Exception $e) {
            Log::error('Payment success error: ' . $e->getMessage());
            return redirect('http://localhost:3000/enterprise/payment/fail');
        }
    }
    public function handleFailure(Request $request)
    {
        try {
            $paymentId = $request->query('payment_id');
            if ($paymentId) {
                $payment = EntreprisePayment::where('transaction_id', $paymentId)->first();

                if ($payment) {
                    $payment->update(['statut' => 'echoue']);

                    $notificationData = [
                        'montant' => $payment->montant,
                        'transaction_id' => $paymentId,
                        'date' => now()->format('Y-m-d H:i:s'),
                        'type' => $payment->type_paiement === 'subscription' ? 'Abonnement' : 'Publicité'
                    ];
    
                    // Utiliser NotificationController pour notifier l'entreprise
                    $notificationController = new NotificationController();
                    $notificationController->sendToEntreprises(new Request([
                        'type' => 'payment_failed',
                        'target_type' => 'entreprise',
                        'target_id' => $payment->entreprise_id,
                        'data' => $notificationData
                    ]));

                    if ($payment->type_paiement === 'subscription') {
                        // Échec abonnement
                        $payment->subscription->update([
                            'status' => 'inactive',
                            'payment_status' => 'failed'
                        ]);
                    } else if ($payment->type_paiement === 'publicite') {
                        // Échec publicité via l'API loisirs
                        $response = Http::put(env('LOISIRS_SERVICE_URL', 'http://127.0.0.1:8000') . '/api/publicites/' . $payment->publicite_id . '/payment-status', [
                            'payment_status' => 'failed',
                            'statut' => 'pending',
                            'date_debut' => now()
                        ]);

                        Log::info('Publicite payment failure update response:', [
                            'status' => $response->status(),
                            'body' => $response->json()
                        ]);
                        return redirect('http://localhost:3000/enterprise/publicite/payment/fail');
                    }
                }
            }

            return redirect('http://localhost:3000/enterprise/payment/fail');
        } catch (\Exception $e) {
            Log::error('Payment failure error: ' . $e->getMessage());
            return redirect('http://localhost:3000/enterprise/payment/fail');
        }
    }
    // public function handleSuccess(Request $request)
    // {
    //     try {
    //         $paymentId = $request->query('payment_id');
    //         if (!$paymentId) {
    //             return redirect('http://localhost:3000/enterprise/payment/fail');
    //         }

    //         // Vérifier le paiement avec Flouci
    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //             'apppublic' => config('services.flouci.token'),
    //             'appsecret' => config('services.flouci.secret'),
    //         ])->get("https://developers.flouci.com/api/verify_payment/{$paymentId}");

    //         if (!$response->successful() || !$response->json()['success']) {
    //             return redirect('http://localhost:3000/enterprise/payment/fail');
    //         }

    //         $result = $response->json();
    //         $payment = SubscriptionPayment::where('transaction_id', $paymentId)->firstOrFail();

    //         if ($result['result']['status'] === 'SUCCESS') {
    //             $payment->update(['statut' => 'reussi']);

    //             if ($payment->type_paiement === 'subscription') {
    //                 // Mise à jour abonnement
    //                 $payment->subscription->update([
    //                     'status' => 'active',
    //                     'payment_status' => 'completed'
    //                 ]);
    //                 return redirect('http://localhost:3000/enterprise/payment/success');
    //             } else if ($payment->type_paiement === 'publicite') {
    //                 // Mise à jour publicité via l'API loisirs
    //                 Http::put(env('LOISIRS_SERVICE_URL', 'http://127.0.0.1:8000') . '/api/publicites/' . $payment->publicite_id . '/payment-status', [
    //                     'payment_status' => 'paid',
    //                     'date_debut' => now(),
    //                     'date_fin' => now()->addDays($payment->publicite->nbJours)
    //                 ]);
    //                 return redirect('http://localhost:3000/enterprise/payment/success');
    //             }
    //         }

    //         return redirect('http://localhost:3000/enterprise/payment/fail');
    //     } catch (\Exception $e) {
    //         Log::error('Payment success error: ' . $e->getMessage());
    //         return redirect('http://localhost:3000/enterprise/payment/fail');
    //     }
    // }

    // public function handleFailure(Request $request)
    // {
    //     try {
    //         $paymentId = $request->query('payment_id');
    //         if ($paymentId) {
    //             $payment = SubscriptionPayment::where('transaction_id', $paymentId)->first();

    //             if ($payment) {
    //                 $payment->update(['statut' => 'echoue']);

    //                 if ($payment->type_paiement === 'subscription') {
    //                     // Échec abonnement
    //                     $payment->subscription->update([
    //                         'status' => 'inactive',
    //                         'payment_status' => 'failed'
    //                     ]);
    //                 } else if ($payment->type_paiement === 'publicite') {
    //                     // Échec publicité via l'API loisirs
    //                     Http::put(env('LOISIRS_SERVICE_URL', 'http://127.0.0.1:8000') . '/api/publicites/' . $payment->publicite_id . '/payment-status', [
    //                         'payment_status' => 'failed',
    //                         'date_debut' => now(),
    //                         'date_fin' => null
    //                     ]);
    //                 }
    //             }
    //         }

    //         return redirect('http://localhost:3000/enterprise/payment/fail');
    //     } catch (\Exception $e) {
    //         Log::error('Payment failure error: ' . $e->getMessage());
    //         return redirect('http://localhost:3000/enterprise/payment/fail');
    //     }
    // }
    //v2.0 marche correctement mais son la modification de publicite 
    // public function handleSuccess(Request $request)
    // {
    //     try {
    //         $paymentId = $request->query('payment_id');
    //         if (!$paymentId) {
    //             return redirect('http://localhost:3000/enterprise/payment/fail');
    //         }

    //         // Vérifier le paiement avec Flouci
    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //             'apppublic' => config('services.flouci.token'),
    //             'appsecret' => config('services.flouci.secret'),
    //         ])->get("https://developers.flouci.com/api/verify_payment/{$paymentId}");

    //         if (!$response->successful() || !$response->json()['success']) {
    //             return redirect('http://localhost:3000/enterprise/payment/fail');
    //         }

    //         // Récupérer le paiement
    //         $payment = SubscriptionPayment::where('transaction_id', $paymentId)->firstOrFail();
    //         $result = $response->json();

    //         if ($result['result']['status'] === 'SUCCESS') {
    //             $payment->update(['statut' => 'reussi']);

    //             if ($payment->type_paiement === 'subscription') {
    //                 // Mise à jour abonnement
    //                 $payment->subscription->update([
    //                     'status' => 'active',
    //                     'payment_status' => 'completed'
    //                 ]);
    //                 return redirect('http://localhost:3000/enterprise/payment/success');
    //             } else if ($payment->type_paiement === 'publicite') {
    //                 // Mise à jour publicité
    //                 return redirect('http://localhost:3000/enterprise/payment/success');
    //             }
    //         }

    //         return redirect('http://localhost:3000/enterprise/payment/fail');
    //     } catch (\Exception $e) {
    //         Log::error('Payment success error: ' . $e->getMessage());
    //         return redirect('http://localhost:3000/enterprise/payment/fail');
    //     }
    // }

    // public function handleFailure(Request $request)
    // {
    //     try {
    //         $paymentId = $request->query('payment_id');
    //         if ($paymentId) {
    //             $payment = SubscriptionPayment::where('transaction_id', $paymentId)->first();

    //             if ($payment) {
    //                 $payment->update(['statut' => 'echoue']);

    //                 if ($payment->type_paiement === 'subscription') {
    //                     // Échec abonnement
    //                     $payment->subscription->update([
    //                         'status' => 'inactive',
    //                         'payment_status' => 'failed'
    //                     ]);
    //                     return redirect('http://localhost:3000/enterprise/payment/fail');
    //                 } else if ($payment->type_paiement === 'publicite') {
    //                     // Échec publicité
    //                     return redirect('http://localhost:3000/enterprise/payment/fail');
    //                 }
    //             }
    //         }

    //         return redirect('http://localhost:3000/enterprise/payment/fail');
    //     } catch (\Exception $e) {
    //         Log::error('Payment failure error: ' . $e->getMessage());
    //         return redirect('http://localhost:3000/enterprise/payment/fail');
    //     }
    // }

    //v1.0 handl succes et handl failure 
    // public function handleSuccess(Request $request)
    // {
    //     try {
    //         $paymentId = $request->query('payment_id');
    //         if (!$paymentId) {
    //             // return redirect('/fail')->with('error', 'Payment ID missing');
    //             return redirect('http://localhost:3000/enterprise/payment/fail');

    //         }

    //         // Vérifier le statut du paiement via l'API Flouci
    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //             'apppublic' => config('services.flouci.token'),
    //             'appsecret' => config('services.flouci.secret'),
    //         ])->get("https://developers.flouci.com/api/verify_payment/{$paymentId}");

    //         if (!$response->successful() || !$response->json()['success']) {
    //             // return redirect('/fail')->with('error', 'Payment verification failed');
    //             return redirect('http://localhost:3000/enterprise/payment/fail');
    //         }

    //         // Récupérer les détails du paiement
    //         $result = $response->json();
    //         $payment = SubscriptionPayment::where('transaction_id', $paymentId)->firstOrFail();
    //         $subscription = $payment->subscription;

    //         // Mise à jour du statut du paiement et de l'abonnement
    //         if ($result['result']['status'] === 'SUCCESS') {
    //             $payment->update(['statut' => 'reussi']);
    //             $subscription->update(['status' => 'active', 'payment_status' => 'completed']);

    //             // Retourner une vue de succès
    //             // return view('payment.success', [
    //             //     'subscription' => $subscription,
    //             //     'payment' => $payment
    //             // ]);
    //             return redirect('http://localhost:3000/enterprise/payment/success');
    //         } else {
    //             // return redirect('/fail')->with('error', 'Paiement non confirmé');
    //             return redirect('http://localhost:3000/enterprise/payment/fail');

    //         }
    //     } catch (\Exception $e) {
    //         Log::error('Payment success error: ' . $e->getMessage());
    //         // return redirect('/fail')->with('error', 'An error occurred');
    //         return redirect('http://localhost:3000/enterprise/payment/fail');

    //     }
    // }
    // public function handleFailure(Request $request)
    // {
    //     try {
    //         $paymentId = $request->query('payment_id');

    //         if ($paymentId) {
    //             $payment = SubscriptionPayment::where('transaction_id', $paymentId)->first();
    //             if ($payment) {
    //                 $payment->update(['statut' => 'echoue']);

    //                 $subscription = $payment->subscription;
    //                 $subscription->update(['status' => 'inactive', 'payment_status' => 'failed']);
    //             }
    //         }

    //         // return view('payment.failure');
    //         return redirect('http://localhost:3000/enterprise/payment/fail');

    //     } catch (\Exception $e) {
    //         Log::error('Payment failure error: ' . $e->getMessage());
    //         // return view('payment.failure');
    //         return redirect('http://localhost:3000/enterprise/payment/fail');

    //     }
    // }
}
