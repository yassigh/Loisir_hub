<?php

namespace App\Notifications\Reservation;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReservationCancelled extends Notification
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
        return (new MailMessage)
            ->subject('Réservation annulée')
            ->greeting('Bonjour,')
            ->line('Une réservation a été annulée:')
            ->line('Activité: ' . $this->reservationData['activity_name'])
            ->line('Client: ' . $this->reservationData['user_name'])
            ->line('Date prévue: ' . $this->reservationData['dateDebut'])
            ->line('Raison: ' . $this->reservationData['reason']);
    }

    public function toArray($notifiable)
    {
        return $this->reservationData;
    }
}
