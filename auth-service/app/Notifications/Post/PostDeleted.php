<?php

namespace App\Notifications\Post;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PostDeleted extends Notification
{
    use Queueable;

    protected $postData;

    public function __construct($postData)
    {
        $this->postData = $postData;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Poste Supprimé')
            ->greeting('Bonjour,')
            ->line('Un poste a été supprimé:')
            ->line('Nom: ' . $this->postData['post_name'])
            ->line('Lieu: ' . $this->postData['post_lieu'])
            ->line('Supprimé par: ' . $this->postData['enterprise_name'])
            ->line('Email entreprise: ' . $this->postData['enterprise_email']);
    }

    public function toArray($notifiable): array
    {
        return $this->postData;
    }
}
