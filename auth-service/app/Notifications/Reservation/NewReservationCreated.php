<?php

namespace App\Notifications\Reservation;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewReservationCreated extends Notification
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
            ->subject('Nouvelle réservation')
            ->greeting('Bonjour,')
            ->line('Une nouvelle réservation a été créée:')
            ->line('Activité: ' . $this->reservationData['activity_name'])
            ->line('Client: ' . $this->reservationData['user_name'])
            ->line('Date: ' . $this->reservationData['dateDebut']);
    }

    public function toArray($notifiable)
    {
        return $this->reservationData;
    }
}
