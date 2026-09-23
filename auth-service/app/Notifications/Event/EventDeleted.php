<?php

namespace App\Notifications\Event;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventDeleted extends Notification
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
            ->subject('Événement Supprimé')
            ->greeting('Bonjour,')
            ->line('Un événement a été supprimé:')
            ->line('Nom: ' . $this->eventData['event_name'])
            ->line('Lieu: ' . $this->eventData['event_lieu'])
            ->line('Supprimé par: ' . $this->eventData['enterprise_name'])
            ->line('Email entreprise: ' . $this->eventData['enterprise_email']);
    }

    public function toArray($notifiable)
    {
        return $this->eventData;
    }
}
