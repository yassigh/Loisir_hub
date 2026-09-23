<?php

namespace App\Notifications\Publicite;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PubliciteStatusChanged extends Notification
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
        $statusMessage = $this->publiciteData['statut'] === 'approved' ? 'approuvée' : 'rejetée';
        
        return (new MailMessage)
            ->subject('Statut de la Publicité Modifié')
            ->greeting('Bonjour,')
            ->line('Le statut d\'une publicité a été modifié:')
            ->line('ID de la publicité: ' . $this->publiciteData['publicite_id'])
            ->line('Nouveau statut: ' . $statusMessage)
            ->line('Entreprise: ' . $this->publiciteData['enterprise_name'])
            ->line('Email entreprise: ' . $this->publiciteData['enterprise_email'])
            ->line($this->getStatusSpecificMessage($this->publiciteData['statut']));
    }

    /**
     * Get a status-specific message.
     */
    private function getStatusSpecificMessage($status)
    {
        if ($status === 'approved') {
            return 'La publicité a été approuvée et sera visible sur la plateforme.';
        }
        return 'La publicité a été rejetée et ne sera pas publiée sur la plateforme.';
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
