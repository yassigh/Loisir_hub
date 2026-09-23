<?php

namespace App\Http\Controllers\Entreprise;

use App\Http\Controllers\Controller;
use App\Models\ActivitePayant;
use App\Models\Evenement;
use App\Models\Poste;
use App\Models\Publicite;
use App\Models\Reservation;
use App\Models\Paiement;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;



class EntrepriseStatsController extends Controller
{
    public function getDashboardStats(Request $request)
    {
        try {
            $entrepriseId = $request->user_data['user']['id'];

            // Basic stats
            $basicStats = [
                'totalReservations' => Reservation::where('entreprise_id', $entrepriseId)->count(),
                'totalClients' => Reservation::where('entreprise_id', $entrepriseId)
                    ->distinct('user_id')
                    ->count('user_id'),
                'totalActivites' => ActivitePayant::where('entreprise_id', $entrepriseId)->count(),
                'totalEvenements' => Evenement::where('entreprise_id', $entrepriseId)->count(),
                'totalPostes' => Poste::where('entreprise_id', $entrepriseId)->count(),
                'totalPublicites' => Publicite::where('entreprise_id', $entrepriseId)->count()
            ];

            // Revenue stats
            $revenueStats = $this->getRevenueStats($entrepriseId);

            // Reservation stats by activity
            $reservationStats = $this->getReservationStats($entrepriseId);

            // Monthly stats
            $monthlyStats = $this->getMonthlyStats($entrepriseId);

            return response()->json([
                ...$basicStats,
                'revenue' => $revenueStats,
                'reservationsParActivite' => $reservationStats,
                'monthlyStats' => $monthlyStats,
                'performanceMetrics' => $this->getPerformanceMetrics($entrepriseId)
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function getRevenueStats($entrepriseId)
    {
        return [
            'totalRevenue' => Paiement::where('entreprise_id', $entrepriseId)
                ->where('statut', 'reussi')
                ->sum('montant'),
            'averageReservationValue' => Paiement::where('entreprise_id', $entrepriseId)
                ->where('statut', 'reussi')
                ->avg('montant')
        ];
    }

    private function getReservationStats($entrepriseId)
    {
        return Reservation::join('activite_payants', 'reservations.id_Act', '=', 'activite_payants.idActP')
            ->where('activite_payants.entreprise_id', $entrepriseId)
            ->select(
                'activite_payants.idActP',
                'activite_payants.nomActP',
                DB::raw('COUNT(reservations.id_Res) as total_reservations'),
                DB::raw('SUM(reservations.nbPersonnes) as total_participants')
            )
            ->groupBy('activite_payants.idActP', 'activite_payants.nomActP')
            ->get();
    }

    private function getMonthlyStats($entrepriseId)
    {
        $currentYear = now()->year;

        return [
            'reservations' => $this->getMonthlyReservations($entrepriseId, $currentYear),
            'revenue' => $this->getMonthlyRevenue($entrepriseId, $currentYear),
            'activites' => $this->getMonthlyActivities($entrepriseId, $currentYear),
            'events' => $this->getMonthlyEvents($entrepriseId, $currentYear)
        ];
    }

    private function getMonthlyReservations($entrepriseId, $year)
    {
        return Reservation::where('entreprise_id', $entrepriseId)
            ->whereYear('created_at', $year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(nbPersonnes) as participants')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    private function getMonthlyRevenue($entrepriseId, $year)
    {
        return Paiement::where('entreprise_id', $entrepriseId)
            ->where('statut', 'reussi')
            ->whereYear('created_at', $year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(montant) as total')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    private function getMonthlyActivities($entrepriseId, $year)
    {
        return ActivitePayant::where('entreprise_id', $entrepriseId)
            ->whereYear('created_at', $year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    private function getMonthlyEvents($entrepriseId, $year)
    {
        return Evenement::where('entreprise_id', $entrepriseId)
            ->whereYear('created_at', $year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    private function getPerformanceMetrics($entrepriseId)
    {
        $totalReservations = Reservation::where('entreprise_id', $entrepriseId)->count();
        $successfulReservations = Reservation::where('entreprise_id', $entrepriseId)
            ->where('etat', 'accepte')
            ->count();

        return [
            'reservationSuccessRate' => $totalReservations > 0 ? 
                ($successfulReservations / $totalReservations) * 100 : 0,
            'popularActivities' => $this->getPopularActivities($entrepriseId),
            'clientRetentionRate' => $this->getClientRetentionRate($entrepriseId)
        ];
    }

    private function getPopularActivities($entrepriseId)
    {
        return ActivitePayant::where('entreprise_id', $entrepriseId)
            ->withCount('reservations')
            ->orderByDesc('reservations_count')
            ->limit(5)
            ->get(['idActP', 'nomActP', 'reservations_count']);
    }

    private function getClientRetentionRate($entrepriseId)
    {
        $repeatingClients = Reservation::where('entreprise_id', $entrepriseId)
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();

        $totalClients = Reservation::where('entreprise_id', $entrepriseId)
            ->distinct('user_id')
            ->count('user_id');

        return $totalClients > 0 ? ($repeatingClients / $totalClients) * 100 : 0;
    }
}