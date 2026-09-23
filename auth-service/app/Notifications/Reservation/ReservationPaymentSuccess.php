<?php

namespace App\Notifications\Reservation;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReservationPaymentSuccess extends Notification
{
    use Queueable;
    protected $paymentData;

    public function __construct($paymentData)
    {
        $this->paymentData = $paymentData;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Paiement réservation réussi')
            ->greeting('Bonjour,')
            ->line("Un paiement de réservation a été effectué par " . $this->paymentData['user_nom'])
            ->line("Montant: " . $this->paymentData['montant'] . " TND")
            ->line("Date: " . $this->paymentData['date']);
    }

    public function toArray($notifiable)
    {
        return $this->paymentData;
    }
}
