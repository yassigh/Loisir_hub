<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\Notifications\NotificationController;


class SendDailyRecommendations extends Command
{
    protected $signature = 'recommendations:send';
    protected $description = 'Send daily recommendations to users';

    public function handle()
    {
        $this->info('Starting daily recommendations process...');
        
        try {
            $controller = new NotificationController();
            $result = $controller->sendDailyRecommendations();
            
            $this->info('Daily recommendations sent successfully');
            return 0;
        } catch (\Exception $e) {
            $this->error('Error sending recommendations: ' . $e->getMessage());
            return 1;
        }
    }
}
