<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;



class CheckSubscriptionLimits
{
    public function handle(Request $request, Closure $next)
    {
        // Récupérer les données de l'utilisateur connecté (entreprise)
        $entreprise = $request->user_data['user'];

        // Appeler l'API de auth-service pour récupérer l'abonnement actif
        $response = Http::withHeaders([
            'Authorization' => $request->header('Authorization')
        ])->get(env('AUTH_SERVICE_URL') . '/api/subscriptions/limits', [
            'entreprise_id' => $entreprise['id']
        ]);

        if (!$response->successful()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Échec de la vérification de l\'abonnement'
            ], 403);
        }

        $limits = $response->json()['limits'];
        $endDate = Carbon::parse($limits['end_date']);
        $activitiesLimit = $limits['activities_limit'];

        // Vérifier si l'abonnement est actif et non expiré
        if (Carbon::now()->gt($endDate)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Votre abonnement a expiré'
            ], 403);
        }

        // Vérifier les limites selon le type de ressource
        if (strpos($request->path(), 'activites-payantes') !== false) {
            $count = \App\Models\ActivitePayant::where('entreprise_id', $entreprise['id'])
                ->where('status', '!=', 'rejected')
                ->count();

            if ($count >= $activitiesLimit) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Limite d\'activités atteinte'
                ], 403);
            }
        }

        return $next($request);
    }

    private function checkActivityLimit($entrepriseId, $plan)
    {
        if (!$plan['activities_limit']) return false;

        // Compter les activités existantes dans loisirs-service
        $count = \App\Models\ActivitePayant::where('entreprise_id', $entrepriseId)
            ->where('status', '!=', 'rejected')
            ->count();

        return $count >= $plan['activities_limit'];
    }

    private function checkEventLimit($entrepriseId, $plan)
    {
        if (!$plan['events_limit']) return false;

        $count = \App\Models\Evenement::where('entreprise_id', $entrepriseId)
            ->where('status', '!=', 'rejected')
            ->count();

        return $count >= $plan['events_limit'];
    }

    private function checkPostLimit($entrepriseId, $plan)
    {
        if (!$plan['posts_limit']) return false;

        $count = \App\Models\Poste::where('entreprise_id', $entrepriseId)
            ->where('status', '!=', 'rejected')
            ->count();

        return $count >= $plan['posts_limit'];
    }
}
