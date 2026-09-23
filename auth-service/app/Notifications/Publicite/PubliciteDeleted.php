<?php

namespace App\Notifications\Publicite;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class PubliciteDeleted extends Notification
{
    use Queueable;
    protected $publiciteData;

    public function __construct($publiciteData)
    {
        $this->publiciteData = $publiciteData;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Publicité Supprimée')
            ->greeting('Bonjour,')
            ->line('Une publicité a été supprimée:')
            ->line('ID de la publicité: ' . $this->publiciteData['publicite_id'])
            ->line('Date de début: ' . $this->publiciteData['date_debut'])
            ->line('Durée: ' . $this->publiciteData['nbJours'] . ' jours')
            ->line('Montant: ' . $this->publiciteData['montantAPayer'] . ' €')
            ->line('Entreprise: ' . $this->publiciteData['enterprise_name'])
            ->line('Email entreprise: ' . $this->publiciteData['enterprise_email']);
    }

    public function toArray($notifiable)
    {
        return $this->publiciteData;
    }
}
