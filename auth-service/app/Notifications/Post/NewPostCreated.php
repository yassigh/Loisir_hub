<?php

namespace App\Notifications\Post;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewPostCreated extends Notification
{
    protected $postData;

    public function __construct($postData)
    {
        $this->postData = $postData;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Nouveau Poste Créé')
            ->greeting('Bonjour,')
            ->line('Un nouveau poste a été créé:')
            ->line('Nom: ' . $this->postData['post_name'])
            ->line('Lieu: ' . $this->postData['post_lieu'])
            ->line('Type: ' . $this->postData['post_type'])
            ->line('Créé par: ' . ($this->postData['actor_name'] ?? 'Non spécifié'))
            ->line('Email entreprise: ' . ($this->postData['enterprise_email'] ?? 'Non spécifié'));
    }

    public function toArray($notifiable)
    {
        return $this->postData;
    }
}
