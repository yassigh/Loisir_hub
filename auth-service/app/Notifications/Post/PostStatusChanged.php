<?php

namespace App\Notifications\Post;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PostStatusChanged extends Notification
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
        $statusMessage = $this->postData['status'] === 'approved' 
            ? 'Votre publication a été approuvée'
            : 'Votre publication a été refusée';

        return (new MailMessage)
            ->subject('Statut de votre publication mis à jour')
            ->greeting('Bonjour,')
            ->line($statusMessage)
            ->line('Détails de la publication:')
            ->line('Nom: ' . $this->postData['post_name'])
            ->line('Lieu: ' . $this->postData['post_lieu']);
    }

    public function toArray($notifiable)
    {
        return $this->postData;
    }
}
