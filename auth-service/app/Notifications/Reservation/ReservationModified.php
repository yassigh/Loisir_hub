<?php

namespace App\Notifications\Reservation;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReservationModified extends Notification
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
            ->subject('Réservation modifiée')
            ->greeting('Bonjour,')
            ->line('Une réservation a été modifiée:')
            ->line('Activité: ' . $this->reservationData['activity_name'])
            ->line('Client: ' . $this->reservationData['user_name'])
            ->line('Nouvelle date: ' . $this->reservationData['dateDebut']);
    }

    public function toArray($notifiable)
    {
        return $this->reservationData;
    }
}
