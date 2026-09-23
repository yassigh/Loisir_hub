<?php

namespace App\Notifications\Publicite;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class PubliciteModified extends Notification
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
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Publicité Modifiée')
            ->greeting('Bonjour,')
            ->line('Une publicité a été modifiée:')
            ->line('Ancienne date de début: ' . $this->publiciteData['old_publicite']['date_debut'])
            ->line('Nouvelle date de début: ' . $this->publiciteData['new_publicite']['date_debut'])
            ->line('Ancienne durée: ' . $this->publiciteData['old_publicite']['nbJours'] . ' jours')
            ->line('Nouvelle durée: ' . $this->publiciteData['new_publicite']['nbJours'] . ' jours')
            ->line('Ancien montant: ' . $this->publiciteData['old_publicite']['montantAPayer'] . ' €')
            ->line('Nouveau montant: ' . $this->publiciteData['new_publicite']['montantAPayer'] . ' €')
            ->line('Entreprise: ' . $this->publiciteData['enterprise_name'])
            ->line('Email entreprise: ' . $this->publiciteData['enterprise_email']);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray($notifiable)
    {
        return $this->publiciteData;
    }
}
