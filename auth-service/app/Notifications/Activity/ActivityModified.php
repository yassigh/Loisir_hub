<?php

namespace App\Notifications\Activity;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ActivityModified extends Notification
{
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
            ->subject('Activité Modifiée')
            ->greeting('Bonjour,')
            ->line('Une activité a été modifiée:')
            ->line('Ancienne version:')
            ->line('Nom: ' . $this->activityData['old_activity']['nomActP'])
            ->line('Lieu: ' . $this->activityData['old_activity']['lieuP'])
            ->line('Nouvelle version:')
            ->line('Nom: ' . $this->activityData['new_activity']['nomActP'])
            ->line('Lieu: ' . $this->activityData['new_activity']['lieuP'])
            ->line('Modifiée par: ' . $this->activityData['enterprise_name'])
            ->line('Email entreprise: ' . $this->activityData['enterprise_email']);
    }

    public function toArray($notifiable)
    {
        return $this->activityData;
    }
}
