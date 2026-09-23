<?php

namespace App\Notifications\Activity;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewActivityCreated extends Notification
{
    use Queueable;

    protected $activityData;

    public function __construct($activityData)
    {
        $this->activityData = $activityData;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $durationText = $this->formatDuration(
            $this->activityData['heure'] ?? null,
            $this->activityData['minute'] ?? null,
            $this->activityData['jours'] ?? null
        );

        return (new MailMessage)
            ->subject('Nouvelle Activité Créée')
            ->greeting('Bonjour,')
            ->line('Une nouvelle activité a été créée:')
            ->line('Nom de l\'activité: ' . ($this->activityData['activity_name'] ?? 'Non spécifié'))
            ->line('Lieu: ' . ($this->activityData['activity_lieu'] ?? 'Non spécifié'))
            ->line('Créée par: ' . ($this->activityData['enterprise_name'] ?? 'Non spécifié'))
            ->line('Email entreprise: ' . ($this->activityData['enterprise_email'] ?? 'Non spécifié'))
            ->line('Durée: ' . $durationText)
            ->action('Voir l\'activité', env('FRONT_URL') . '/admin/activities/' . $this->activityData['activity_id'])
            ->line('Merci de vérifier cette nouvelle activité.');
    }

    protected function formatDuration($heures, $minutes, $jours)
    {
        $parts = [];
        
        if ($jours) {
            $parts[] = $jours . ' jour(s)';
        }
        if ($heures) {
            $parts[] = $heures . ' heure(s)';
        }
        if ($minutes) {
            $parts[] = $minutes . ' minute(s)';
        }
        
        return !empty($parts) ? implode(', ', $parts) : 'Non spécifié';
    }

    public function toArray($notifiable)
    {
       return [
        'type' => 'new_activity',
        'activity_name' => $this->activityData['activity_name'] ?? '',
        'activity_lieu' => $this->activityData['activity_lieu'] ?? '',
        'enterprise_name' => $this->activityData['enterprise_name'] ?? '',
        'message' => "Nouvelle activité créée : " . ($this->activityData['activity_name'] ?? ''),
    ];
    }
}
