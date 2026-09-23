<?php

namespace App\Notifications\Activity;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ActivityStatusChanged extends Notification
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
        $statusMessage = $this->activityData['status'] === 'approved' 
            ? 'Votre activité a été approuvée'
            : 'Votre activité a été refusée';

        $mailMessage = (new MailMessage)
            ->subject('Statut de votre activité mis à jour')
            ->greeting('Bonjour,')
            ->line($statusMessage)
            ->line('Détails de l\'activité:')
            ->line('Nom: ' . $this->activityData['activity_name'])
            ->line('Lieu: ' . $this->activityData['activity_lieu']);

        // if ($this->activityData['status'] === 'rejected') {
        //     $mailMessage->line('Raison: ' . ($this->activityData['reason'] ?? 'Non spécifiée'));
        // }

        return $mailMessage;
    }

    public function toArray($notifiable)
    {
        return $this->activityData;
    }
}
