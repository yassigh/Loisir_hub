<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Entreprise;
use App\Models\Desactivation;

class DeleteOldDesactivatedAccounts extends Command
{
    protected $signature = 'delete:old-accounts';
    protected $description = 'Supprime les comptes désactivés depuis plus de 30 jours';

    public function handle()
    {
        $now = Carbon::now();

        // Récupérer les comptes désactivés depuis plus de 30 jours et non encore supprimés
        $desactivations = Desactivation::where('date_fin', '<', $now)
            ->where('is_deleted', false)
            ->get();

        $deletedCount = 0;

        foreach ($desactivations as $desactivation) {
            try {
                if ($desactivation->type === 'user' && $desactivation->user_id) {
                    User::where('id', $desactivation->user_id)->forceDelete();
                } elseif ($desactivation->type === 'entreprise' && $desactivation->entreprise_id) {
                    Entreprise::where('id', $desactivation->entreprise_id)->forceDelete();
                }

                // Marquer la désactivation comme supprimée
                $desactivation->update(['is_deleted' => true]);
                $deletedCount++;
            } catch (\Exception $e) {
                $this->error("Erreur lors de la suppression d'un compte : " . $e->getMessage());
            }
        }

        $this->info("$deletedCount comptes désactivés depuis plus de 30 jours ont été supprimés.");
    }
}
