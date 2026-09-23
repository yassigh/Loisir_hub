<?php

namespace App\Notifications\Reservation;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReservationStatusChanged extends Notification
{
    use Queueable;
    protected $reservationData;

    public function __construct($reservationData)
    {
        $this->reservationData = $reservationData;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $statusMessage = $this->reservationData['etat'] === 'accepte' 
            ? 'Votre réservation a été acceptée'
            : 'Votre réservation a été refusée';

        return (new MailMessage)
            ->subject('Statut de réservation modifié')
            ->greeting('Bonjour,')
            ->line($statusMessage)
            ->line('Activité: ' . $this->reservationData['activity_name'])
            ->line('Date: ' . $this->reservationData['dateDebut']);
    }

    public function toArray($notifiable)
    {
        return $this->reservationData;
    }
}
