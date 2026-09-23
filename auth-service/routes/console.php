<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Console\Commands\DeleteOldDesactivatedAccounts;
use App\Console\Commands\SendDailyRecommendations;


Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Planifier la suppression automatique des comptes désactivés
//Schedule::command('delete:old-accounts')->everySecond();
Schedule::command('delete:old-accounts')->daily();
Schedule::command('recommendations:send')
    ->dailyAt('18:10')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/scheduler.log'));
