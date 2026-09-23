<?php

namespace App\Notifications\Publicite;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewPubliciteCreated extends Notification
{
    use Queueable;

    protected $publiciteData;

    /**
     * Create a new notification instance.
     */
    public function __construct($publiciteData)
    {
        $this->publiciteData = $publiciteData;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouvelle Publicité Créée')
            ->greeting('Bonjour,')
            ->line('Une nouvelle publicité a été créée:')
            ->line('ID de la publicité: ' . $this->publiciteData['publicite_id'])
            ->line('Date de début: ' . $this->publiciteData['date_debut'])
            ->line('Durée: ' . $this->publiciteData['nbJours'] . ' jours')
            ->line('Montant: ' . $this->publiciteData['montantAPayer'] . ' €')
            ->line('Entreprise: ' . $this->publiciteData['enterprise_name'])
            ->line('Email entreprise: ' . $this->publiciteData['enterprise_email']);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->publiciteData;
    }
}
