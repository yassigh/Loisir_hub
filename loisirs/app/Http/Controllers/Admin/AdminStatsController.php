<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivitePayant;
use App\Models\Evenement;
use App\Models\Poste;
use App\Models\Publicite;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    public function getDashboardStats()
    {
        try {
            // Statistiques de base
            $basicStats = [
                'totalActivites' => ActivitePayant::count(),
                'totalEvenements' => Evenement::count(),
                'totalPostes' => Poste::count(),
                'totalPublicites' => Publicite::count(),
                'totalReservations' => Reservation::count(),
            ];

            // Statistiques des réservations par activité
            $reservationStats = $this->getReservationStats();

            return response()->json([
                ...$basicStats,
                'reservationsParActivite' => $reservationStats,
                'monthlyStats' => $this->getMonthlyStats()
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    protected function getReservationStats()
    {
        return Reservation::join('activite_payants', 'reservations.id_Act', '=', 'activite_payants.idActP')
            ->select(
                'activite_payants.idActP',
                'activite_payants.nomActP as titre',
                DB::raw('COUNT(reservations.id_Res) as total_reservations'),
                DB::raw('SUM(reservations.nbPersonnes) as total_places')
            )
            ->groupBy('activite_payants.idActP', 'activite_payants.nomActP')
            ->get();
    }

    protected function getMonthlyStats()
    {
        $currentYear = now()->year;

        return [
            'reservations' => $this->getMonthlyReservations($currentYear),
            'activites' => $this->getMonthlyActivites($currentYear),
            'evenements' => $this->getMonthlyEvenements($currentYear),
            'publicites' => $this->getMonthlyPublicites($currentYear)
        ];
    }

    public function getMonthlyReservations($year)
    {
        return Reservation::whereYear('created_at', $year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(nbPersonnes) as total_places')  // Changed from nombre_places to nbPersonnes
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    private function getMonthlyActivites($year)
    {
        return ActivitePayant::whereYear('created_at', $year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    private function getMonthlyEvenements($year)
    {
        return Evenement::whereYear('created_at', $year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    private function getMonthlyPublicites($year)
    {
        return Publicite::whereYear('created_at', $year)
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }
    public function getReservationsStatistics()
    {
        try {
            return response()->json([
                'reservationsStats' => $this->getReservationStats()
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getMonthlyStatistics()
    {
        try {
            return response()->json([
                'monthlyStats' => $this->getMonthlyStats()
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
