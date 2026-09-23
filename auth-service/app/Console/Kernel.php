<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Planifier la suppression des comptes désactivés après 30 jours
        $schedule->command('delete:old-accounts')->daily();	

        // $schedule->command('recommendations:send')
        //         ->dailyAt('21:05')
        //         ->withoutOverlapping();
        $schedule->command('recommendations:send')
            ->dailyAt('00:05')
            ->withoutOverlapping()
            ->appendOutputTo(storage_path('logs/scheduler.log'));
    }

    protected function commands(): void
    {
        $this->load(app_path('Console/Commands'));
        // $this->load(__DIR__.'/Commands');

    }
}
