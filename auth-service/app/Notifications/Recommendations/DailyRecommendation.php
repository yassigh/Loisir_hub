<?php

namespace App\Notifications\Recommendations;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DailyRecommendation extends Notification
{
    use Queueable;
    protected $recommendation;

    public function __construct($recommendation)
    {
        $this->recommendation = $recommendation;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'id' => $this->recommendation['id'],
            'type' => $this->recommendation['type'],
            'nom' => $this->recommendation['nom'],
            'description' => $this->recommendation['description'],
            'url' => $this->recommendation['url'],
            'message' => "New {$this->recommendation['type']} recommendation: {$this->recommendation['nom']}"
        ];
    }
}
