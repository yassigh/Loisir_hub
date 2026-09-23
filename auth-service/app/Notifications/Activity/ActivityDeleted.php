<?php

namespace App\Notifications\Activity;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ActivityDeleted extends Notification
{
    use Queueable;
    protected $activityData;

    public function __construct($activityData)
    {
        $this->activityData = $activityData;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Activité Supprimée')
            ->greeting('Bonjour,')
            ->line('Une activité a été supprimée:')
            ->line('Nom: ' . $this->activityData['activity_name'])
            ->line('Lieu: ' . $this->activityData['activity_lieu'])
           ->line('Supprimée par: ' . ($this->activityData['enterprise_name'] ?? 'Non spécifié'))
            ->line('Email entreprise: ' . $this->activityData['enterprise_email']);
    }

    public function toArray($notifiable)
    {
        return $this->activityData;
    }
}
