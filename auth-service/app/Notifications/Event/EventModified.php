<?php

namespace App\Notifications\Event;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventModified extends Notification
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
            ->subject('Événement Modifié')
            ->greeting('Bonjour,')
            ->line('Un événement a été modifié:')
            ->line('Ancienne version:')
            ->line('Nom: ' . $this->eventData['old_event']['nomEvent'])
            ->line('Lieu: ' . $this->eventData['old_event']['lieuEvent'])
            ->line('Date début: ' . $this->eventData['old_event']['date_debutEvent'])
            ->line('Date fin: ' . $this->eventData['old_event']['date_finEvent'])
            ->line('Nouvelle version:')
            ->line('Nom: ' . $this->eventData['new_event']['nomEvent'])
            ->line('Lieu: ' . $this->eventData['new_event']['lieuEvent'])
            ->line('Date début: ' . $this->eventData['new_event']['date_debutEvent'])
            ->line('Date fin: ' . $this->eventData['new_event']['date_finEvent'])
            ->line('Modifié par: ' . $this->eventData['enterprise_name'])
            ->line('Email entreprise: ' . $this->eventData['enterprise_email']);
    }

    public function toArray($notifiable)
    {
        return $this->eventData;
    }
}
