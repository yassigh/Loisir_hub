<?php

namespace App\Http\Controllers\Entreprise;

use App\Http\Controllers\Controller;
use App\Models\EntreprisePayment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class EntrepriseStatsController extends Controller
{
    public function getDashboardStats()
    {
        try {
            $entrepriseId = Auth::id();
            
            // Get payment stats
            $paymentStats = $this->getPaymentStats($entrepriseId);
            
            // Get monthly stats
            $monthlyStats = $this->getMonthlyStats($entrepriseId);

            return response()->json([
                'totalPayments' => $paymentStats['totalPayments'],
                'subscriptionStats' => [
                    'total' => $paymentStats['subscriptionPayments'],
                    'count' => $paymentStats['subscriptionCount']
                ],
                'publiciteStats' => [
                    'total' => $paymentStats['publicitePayments'],
                    'count' => $paymentStats['publiciteCount']
                ],
                'monthlyStats' => $monthlyStats
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function getPaymentStats($entrepriseId)
    {
        $baseQuery = EntreprisePayment::where('entreprise_id', $entrepriseId)
            ->where('statut', 'reussi');

        return [
            'totalPayments' => $baseQuery->sum('montant'),
            'subscriptionPayments' => $baseQuery->clone()
                ->where('type_paiement', 'subscription')
                ->sum('montant'),
            'subscriptionCount' => $baseQuery->clone()
                ->where('type_paiement', 'subscription')
                ->count(),
            'publicitePayments' => $baseQuery->clone()
                ->where('type_paiement', 'publicite')
                ->sum('montant'),
            'publiciteCount' => $baseQuery->clone()
                ->where('type_paiement', 'publicite')
                ->count()
        ];
    }

    private function getMonthlyStats($entrepriseId)
    {
        $currentYear = now()->year;

        return [
            'subscriptions' => $this->getMonthlyPaymentsByType($entrepriseId, 'subscription', $currentYear),
            'publicites' => $this->getMonthlyPaymentsByType($entrepriseId, 'publicite', $currentYear)
        ];
    }

    private function getMonthlyPaymentsByType($entrepriseId, $type, $year)
    {
        return EntreprisePayment::where('entreprise_id', $entrepriseId)
            ->where('statut', 'reussi')
            ->where('type_paiement', $type)
            ->whereYear('created_at', $year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(montant) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }
}