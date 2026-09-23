<?php

namespace App\Notifications\Event;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewEventCreated extends Notification
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
        return (new MailMessage)
            ->subject('Nouvel Événement Créé')
            ->greeting('Bonjour,')
            ->line('Un nouvel événement a été créé:')
            ->line('Nom: ' . $this->eventData['event_name'])
            ->line('Lieu: ' . $this->eventData['event_lieu'])
            ->line('Date début: ' . $this->eventData['date_debut'])
            ->line('Date fin: ' . $this->eventData['date_fin'])
            ->line('Créé par: ' . $this->eventData['enterprise_name'])
            ->line('Email entreprise: ' . $this->eventData['enterprise_email']);
    }

    public function toArray($notifiable)
    {
        return $this->eventData;
    }
}
