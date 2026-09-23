<?php

namespace App\Http\Controllers\Paiement;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\EntreprisePayment;


class PublicitePaiementController extends Controller
{
    //v3.0
    public function initiatePublicitePayment(Request $request)
    {
        try {
            $entreprise = $request->user();

            // Récupérer la publicité depuis l'API loisirs
            $publiciteResponse = Http::get(
                env('LOISIRS_SERVICE_URL', 'http://127.0.0.1:8000') .
                    '/api/publicites/' . $request->publicite_id
            );

            if (!$publiciteResponse->successful()) {
                return response()->json([
                    'message' => 'Publicité non trouvée'
                ], 404);
            }

            $publicite = $publiciteResponse->json()['publicite'];

            if ($publicite['statut'] !== 'approved') {
                return response()->json([
                    'message' => 'La publicité doit être approuvée avant de procéder au paiement',
                    'status' => 'error'
                ], 400);
            }

            $paymentData = [
                'app_token' => config('services.flouci.token'),
                'app_secret' => config('services.flouci.secret'),
                'amount' => $publicite['montantAPayer'] * 1000, // Utiliser le montant de la publicité
                'accept_card' => "true",
                'session_timeout_secs' => 1200,
                'success_link' => route('payment.success', [], true),
                'fail_link' => route('payment.failure', [], true),
                'developer_tracking_id' => uniqid(),
            ];

            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->post('https://developers.flouci.com/api/generate_payment', $paymentData);

            if ($response->successful()) {
                $result = $response->json();

                $payment = EntreprisePayment::create([
                    'entreprise_id' => $entreprise->id,
                    'publicite_id' => $request->publicite_id,
                    'montant' => $publicite['montantAPayer'],
                    'transaction_id' => $result['result']['payment_id'],
                    'type_paiement' => 'publicite'
                ]);

                return response()->json([
                    'status' => 'success',
                    'payment_url' => $result['result']['link']
                ]);
            }

            return response()->json(['status' => 'error'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    //v2.0
    // public function initiatePublicitePayment(Request $request)
    // {
    //     try {
    //         $entreprise = $request->user();

    //         $paymentData = [
    //             'app_token' => config('services.flouci.token'),
    //             'app_secret' => config('services.flouci.secret'),
    //             'amount' => $request->montant * 1000,
    //             'accept_card' => "true",
    //             'session_timeout_secs' => 1200,
    //             'success_link' => route('payment.success', [], true),
    //             'fail_link' => route('payment.failure', [], true),
    //             'developer_tracking_id' => uniqid(),
    //         ];

    //         $response = Http::withHeaders(['Content-Type' => 'application/json'])
    //             ->post('https://developers.flouci.com/api/generate_payment', $paymentData);

    //         if ($response->successful()) {
    //             $result = $response->json();

    //             $payment = SubscriptionPayment::create([
    //                 'entreprise_id' => $entreprise->id,
    //                 'publicite_id' => $request->publicite_id,
    //                 'montant' => $request->montant,
    //                 'transaction_id' => $result['result']['payment_id'],
    //                 'type_paiement' => 'publicite'
    //             ]);

    //             return response()->json([
    //                 'status' => 'success',
    //                 'payment_url' => $result['result']['link']
    //             ]);
    //         }

    //         return response()->json(['status' => 'error'], 500);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => $e->getMessage()], 500);
    //     }
    // }
    //     public function handleSuccess(Request $request)
    // {
    //     try {
    //         $paymentId = $request->query('payment_id');
    //         if (!$paymentId) {
    //             return redirect('http://localhost:3000/enterprise/publicite/payment/fail');
    //         }

    //         // Vérifier le statut du paiement via l'API Flouci
    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //             'apppublic' => config('services.flouci.token'),
    //             'appsecret' => config('services.flouci.secret'),
    //         ])->get("https://developers.flouci.com/api/verify_payment/{$paymentId}");

    //         if (!$response->successful() || !$response->json()['success']) {
    //             return redirect('http://localhost:3000/enterprise/publicite/payment/fail');
    //         }

    //         // Récupérer les détails du paiement
    //         $result = $response->json();
    //         $payment = SubscriptionPayment::where('transaction_id', $paymentId)
    //             ->where('type_paiement', 'publicite')
    //             ->firstOrFail();

    //         // Mise à jour du statut du paiement
    //         if ($result['result']['status'] === 'SUCCESS') {
    //             $payment->update(['statut' => 'reussi']);
    //             return redirect('http://localhost:3000/enterprise/publicite/payment/success');
    //         } else {
    //             return redirect('http://localhost:3000/enterprise/publicite/payment/fail');
    //         }
    //     } catch (\Exception $e) {
    //         Log::error('Publicite payment success error: ' . $e->getMessage());
    //         return redirect('http://localhost:3000/enterprise/publicite/payment/fail');
    //     }
    // }

    // public function handleFailure(Request $request)
    // {
    //     try {
    //         $paymentId = $request->query('payment_id');

    //         if ($paymentId) {
    //             $payment = SubscriptionPayment::where('transaction_id', $paymentId)
    //                 ->where('type_paiement', 'publicite')
    //                 ->first();

    //             if ($payment) {
    //                 $payment->update(['statut' => 'echoue']);
    //             }
    //         }

    //         return redirect('http://localhost:3000/enterprise/publicite/payment/fail');
    //     } catch (\Exception $e) {
    //         Log::error('Publicite payment failure error: ' . $e->getMessage());
    //         return redirect('http://localhost:3000/enterprise/publicite/payment/fail');
    //     }
    // }
    //v1.0
    // public function initiatePublicitePayment(Request $request)
    // {
    //     try {
    //         $userData = $request->get('user_data');
    //         if (!isset($userData['user']['id'])) {
    //             return response()->json(['message' => 'Utilisateur non authentifié'], 401);
    //         }

    //         $validated = $request->validate([
    //             'publicite_id' => 'required|exists:publicites,id'
    //         ]);

    //         $publicite = Publicite::findOrFail($validated['publicite_id']);

    //         // Vérifier que la publicité est approuvée
    //         if ($publicite->statut !== 'approved') {
    //             return response()->json(['message' => 'La publicité doit être approuvée avant le paiement'], 400);
    //         }

    //         // Préparer les données pour Flouci
    //         $paymentData = [
    //             'app_token' => config('services.flouci.token'),
    //             'app_secret' => config('services.flouci.secret'),
    //             'amount' => $publicite->montantAPayer * 1000,
    //             'accept_card' => "true",
    //             'session_timeout_secs' => 1200,
    //             'success_link' => url('/paiements/publicites/success'), 
    //             'fail_link' => url('/paiements/publicites/fail'), // Correction ici
    //             'developer_tracking_id' => "3e26f8d8-f4a5-42c8-8bbd-ed4abf181909"
    //         ];

    //         // Appel à l'API Flouci
    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //         ])->post('https://developers.flouci.com/api/generate_payment', $paymentData);

    //         if ($response->successful()) {
    //             $result = $response->json();

    //             // Créer un paiement
    //             Paiement::create([
    //                 'user_id' => $userData['user']['id'],
    //                 'entreprise_id' => $publicite->entreprise_id,
    //                 'publicite_id' => $publicite->id,
    //                 'montant' => $publicite->montantAPayer,
    //                 'statut' => 'en_attente',
    //                 'transaction_id' => $result['result']['payment_id'],
    //                 'methode_paiement' => 'flouci'
    //             ]);

    //             return response()->json([
    //                 'payment_url' => $result['result']['link'],
    //                 'payment_id' => $result['result']['payment_id']
    //             ]);
    //         }

    //         return response()->json([
    //             'message' => 'Erreur lors de l\'initialisation du paiement',
    //             'error' => $response->json()
    //         ], 400);
    //     } catch (\Exception $e) {
    //         Log::error('Erreur initiation paiement publicité: ' . $e->getMessage());
    //         return response()->json(['message' => 'Erreur serveur'], 500);
    //     }
    // }

}
