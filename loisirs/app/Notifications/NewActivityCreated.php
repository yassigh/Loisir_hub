<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\ActivitePayant;


class NewActivityCreated extends Notification implements ShouldQueue
{
    use Queueable;

    protected $activity;

    public function __construct(ActivitePayant $activity)
    {
        $this->activity = $activity;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Nouvelle Activité Créée')
            ->line('Une nouvelle activité a été créée par une entreprise.')
            ->line('Nom de l\'activité: ' . $this->activity->nomActP)
            ->line('Lieu: ' . $this->activity->lieuP)
            ->action('Voir l\'activité', url('/admin/activities/' . $this->activity->idActP))
            ->line('Merci de vérifier cette activité!');
    }

    public function toArray($notifiable)
    {
        return [
            'activity_id' => $this->activity->idActP,
            'activity_name' => $this->activity->nomActP,
            'enterprise_id' => $this->activity->entreprise_id,
            'message' => 'Une nouvelle activité a été créée'
        ];
    }
}
