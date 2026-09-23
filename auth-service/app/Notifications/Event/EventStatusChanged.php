<?php

namespace App\Notifications\Event;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventStatusChanged extends Notification
{
    protected $eventData;

    public function __construct($eventData)
    {
        $this->eventData = $eventData;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $statusMessage = $this->eventData['status'] === 'approved' 
            ? 'Votre événement a été approuvé'
            : 'Votre événement a été refusé';

        return (new MailMessage)
            ->subject('Statut de votre événement mis à jour')
            ->greeting('Bonjour,')
            ->line($statusMessage)
            ->line('Détails de l\'événement:')
            ->line('Nom: ' . $this->eventData['event_name'])
            ->line('Lieu: ' . $this->eventData['event_lieu']);
    }

    public function toArray($notifiable)
    {
        return $this->eventData;
    }
}
