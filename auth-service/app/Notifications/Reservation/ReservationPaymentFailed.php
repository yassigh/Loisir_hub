<?php

namespace App\Notifications\Reservation;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReservationPaymentFailed extends Notification
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
            ->subject('Échec du paiement de réservation')
            ->greeting('Bonjour,')
            ->line("Le paiement de votre réservation a échoué:")
            ->line("Montant: " . $this->paymentData['montant'] . " TND")
            ->line("Veuillez réessayer le paiement.");
    }

    public function toArray($notifiable)
    {
        return $this->paymentData;
    }
}
