<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
class PaymeeService
{
    public function createPayment($amount, $orderId, $callbackUrl)
{
    try {
        $response = Http::withHeaders([
            'Authorization' => 'Token ' . env('PAYMEE_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://sandbox.paymee.tn/api/v1/payments/create', [
            'amount' => $amount,
            'order_id' => $orderId,
            'callback_url' => $callbackUrl,
            'currency' => 'TND',
            'vendor' => env('PAYMEE_MERCHANT_ID'),
        ]);

        if ($response->successful()) {
            $responseData = $response->json();

            if (isset($responseData['data']['token'])) {
                $paymentUrl = "https://sandbox.paymee.tn/payment/{$responseData['data']['token']}";
                return [
                    'success' => true,
                    'payment_url' => $paymentUrl,
                    'token' => $responseData['data']['token'],
                ];
            }
            Log::info('Réponse de Paymee : ', $response->json());
            Log::error('Réponse invalide de Paymee : ', $responseData);
            return [
                'error' => true,
                'message' => 'La réponse de Paymee ne contient pas payment_url.',
                'details' => $responseData,
            ];
        }

        Log::error('Échec de la requête Paymee : ', ['status' => $response->status(), 'body' => $response->body()]);
        return [
            'error' => true,
            'message' => 'Erreur lors de la communication avec Paymee.',
            'details' => $response->body(),
        ];
    } catch (\Exception $e) {
        Log::error('Exception lors de la création du paiement : ', ['error' => $e->getMessage()]);
        return [
            'error' => true,
            'message' => $e->getMessage(),
        ];
    }
}

  
    public function checkPaymentStatus($token)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Token ' . env('PAYMEE_API_KEY'),
            ])->get("https://sandbox.paymee.tn/api/v1/payments/status/{$token}");
    
            if ($response->successful()) {
                return $response->json();
            }
    
            Log::error('Erreur lors de la vérification du statut du paiement : ', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
    
            return [
                'error' => true,
                'message' => 'Erreur lors de la vérification du statut du paiement.',
                'details' => $response->body(),
            ];
        } catch (\Exception $e) {
            Log::error('Exception lors de la vérification du statut du paiement : ', ['error' => $e->getMessage()]);
            return [
                'error' => true,
                'message' => $e->getMessage(),
            ];
        }
    }
    
public function handleCallback(Request $request)
{
    try {
        // Valider les données reçues
        $validatedData = $request->validate([
            'token' => 'required|string',
            'status' => 'required|string|in:paid,failed',
        ]);

        // Rechercher le paiement correspondant
        $payement = Payement::where('payment_token', $validatedData['token'])->first();

        if (!$payement) {
            return response()->json(['error' => 'Paiement introuvable.'], 404);
        }

        // Mettre à jour le statut du paiement
        $payement->update(['status' => $validatedData['status']]);

        return response()->json(['message' => 'Statut du paiement mis à jour avec succès.'], 200);
    } catch (\Exception $e) {
        Log::error('Erreur lors du traitement du callback Paymee : ', ['error' => $e->getMessage()]);
        return response()->json(['error' => 'Une erreur est survenue lors du traitement du callback.'], 500);
    }
}
}