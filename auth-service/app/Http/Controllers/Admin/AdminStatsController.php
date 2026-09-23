<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Entreprise;
use App\Models\EntreprisePayment;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    public function getDashboardStats()
    {
        try {
            // 1. Statistiques de base
            $basicStats = [
                'totalUsers' => User::count(),
                'totalEnterprises' => Entreprise::count(),
            ];

            // 2. Statistiques des paiements
            $paymentStats = $this->getPaymentStats();

            // 3. Statistiques mensuelles
            $monthlyStats = $this->getMonthlyStats();

            return response()->json([
                ...$basicStats,
                'totalRevenue' => $paymentStats['totalRevenue'],
                'subscriptionStats' => [
                    'totalSubscriptions' => $paymentStats['totalSubscriptions'],
                    'totalSubscriptionRevenue' => $paymentStats['subscriptionRevenue']
                ],
                'publiciteStats' => [
                    'totalPublicites' => $paymentStats['totalPublicites'],
                    'totalPubliciteRevenue' => $paymentStats['publiciteRevenue']
                ],
                'monthlyRevenue' => $monthlyStats
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function getPaymentStats()
    {
        return [
            'totalRevenue' => EntreprisePayment::where('statut', 'reussi')->sum('montant'),
            'totalSubscriptions' => EntreprisePayment::where('statut', 'reussi')
                ->where('type_paiement', 'subscription')
                ->count(),
            'subscriptionRevenue' => EntreprisePayment::where('statut', 'reussi')
                ->where('type_paiement', 'subscription')
                ->sum('montant'),
            'totalPublicites' => EntreprisePayment::where('statut', 'reussi')
                ->where('type_paiement', 'publicite')
                ->count(),
            'publiciteRevenue' => EntreprisePayment::where('statut', 'reussi')
                ->where('type_paiement', 'publicite')
                ->sum('montant')
        ];
    }

    private function getMonthlyStats()
    {
        $currentYear = now()->year;

        return [
            'subscriptions' => $this->getMonthlyRevenueByType('subscription', $currentYear),
            'publicites' => $this->getMonthlyRevenueByType('publicite', $currentYear)
        ];
    }

    private function getMonthlyRevenueByType($type, $year)
    {
        return EntreprisePayment::where('statut', 'reussi')
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
    // Ajouter ces nouvelles méthodes à la classe existante

    public function getUserStats()
    {
        return response()->json([
            'totalUsers' => User::count(),
            'activeUsers' => User::where('is_active', true)->count()
        ]);
    }

    public function getEntrepriseStats()
    {
        return response()->json([
            'totalEnterprises' => Entreprise::count(),
            'activeEnterprises' => Entreprise::where('is_active', true)->count()
        ]);
    }

    public function getRevenueStats()
    {
        return response()->json($this->getPaymentStats());
    }

    public function getMonthlySubscriptionStats()
    {
        return response()->json([
            'monthly' => $this->getMonthlyRevenueByType('subscription', now()->year)
        ]);
    }

    public function getMonthlyPubliciteStats()
    {
        return response()->json([
            'monthly' => $this->getMonthlyRevenueByType('publicite', now()->year)
        ]);
    }
}
