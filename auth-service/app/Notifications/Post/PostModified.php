<?php

namespace App\Notifications\Post;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PostModified extends Notification
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
            ->subject('Poste Modifié')
            ->greeting('Bonjour,')
            ->line('Un poste a été modifié:')
            ->line('Ancienne version:')
            ->line('Nom: ' . $this->postData['old_post']['nomPoste'])
            ->line('Lieu: ' . $this->postData['old_post']['lieuPoste'])
            ->line('Type: ' . $this->postData['old_post']['typePoste'])
            ->line('Nouvelle version:')
            ->line('Nom: ' . $this->postData['new_post']['nomPoste'])
            ->line('Lieu: ' . $this->postData['new_post']['lieuPoste'])
            ->line('Type: ' . $this->postData['new_post']['typePoste'])
            ->line('Modifié par: ' . $this->postData['enterprise_name'])
            ->line('Email entreprise: ' . $this->postData['enterprise_email']);
    }

    public function toArray($notifiable): array
    {
        return $this->postData;
    }
}
