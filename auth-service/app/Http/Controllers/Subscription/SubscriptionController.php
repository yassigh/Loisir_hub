<?php

namespace App\Http\Controllers\Subscription;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Validator;
use App\Models\Entreprise;

class SubscriptionController extends Controller
{
    public function getCurrentSubscription(Request $request)
    {
        try {
            $entreprise = $request->user();
            $subscription = $entreprise->currentSubscription;

            return response()->json([
                'status' => 'success',
                'subscription' => $subscription ? $subscription->load('plan') : null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch subscription'
            ], 500);
        }
    }

    //v2.0
    public function subscribe(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'plan_id' => 'required|exists:subscription_plans,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $entreprise = $request->user();
            $plan = SubscriptionPlan::findOrFail($request->plan_id);

            // Créer une pré-inscription à l'abonnement avec un statut "pending"
            $subscription = Subscription::create([
                'entreprise_id' => $entreprise->id,
                'plan_id' => $plan->id,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_in_days),
                'status' => 'inactive', // Abonnement inactif jusqu'au paiement
                'payment_status' => 'pending',
                'amount_paid' => $plan->price
            ]);

            // Rediriger vers le processus de paiement
            return response()->json([
                'status' => 'success',
                'message' => 'Abonnement créé avec succès. Veuillez effectuer le paiement.',
                'subscription_id' => $subscription->id
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Échec de la création de l\'abonnement'
            ], 500);
        }
    }
    public function cancel(Request $request)
    {
        try {
            $entreprise = $request->user();
            $subscription = $entreprise->currentSubscription;

            if (!$subscription) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No active subscription found'
                ], 404);
            }

            $subscription->update([
                'status' => 'cancelled',
                'end_date' => now()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Subscription cancelled successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to cancel subscription'
            ], 500);
        }
    }

    public function history(Request $request)
    {
        try {
            $entreprise = $request->user();
            $subscriptions = $entreprise->subscriptions()
                ->with('plan')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'subscriptions' => $subscriptions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch subscription history'
            ], 500);
        }
    }
    public function getSubscriptionLimits(Request $request)
    {
        try {
            $entreprise = $request->user();
            $subscription = $entreprise->currentSubscription;

            if (!$subscription) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No active subscription found'
                ], 404);
            }

            $plan = $subscription->plan;

            return response()->json([
                'status' => 'success',
                'limits' => [
                    'activities_limit' => $plan->activities_limit,
                    'events_limit' => $plan->events_limit,
                    'posts_limit' => $plan->posts_limit,
                    'ads_allowed' => $plan->ads_allowed,
                    'end_date' => $subscription->end_date
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch subscription limits'
            ], 500);
        }
    }
    //v2.0 getBatchLimits
    public function getBatchLimits(Request $request)
    {
        try {
            $entrepriseIds = $request->input('entreprise_ids', []);

            $limits = Subscription::whereIn('entreprise_id', $entrepriseIds)
                ->where('status', 'active')
                ->where('end_date', '>', now())
                ->with('plan')
                ->get()
                ->mapWithKeys(function ($subscription) {
                    return [
                        $subscription->entreprise_id => [
                            'activities_limit' => $subscription->plan->activities_limit,
                            'events_limit' => $subscription->plan->events_limit,
                            'posts_limit' => $subscription->plan->posts_limit,
                            'ads_allowed' => $subscription->plan->ads_allowed,
                            'end_date' => $subscription->end_date
                        ]
                    ];
                });

            return response()->json([
                'status' => 'success',
                'limits' => $limits
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch batch subscription limits'
            ], 500);
        }
    }
    public function getAllSubscriptions(Request $request)
    {
        try {
            $query = Subscription::with(['entreprise', 'plan'])
                ->orderBy('created_at', 'desc');

            // Filtres
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('payment_status')) {
                $query->where('payment_status', $request->payment_status);
            }

            if ($request->has('date_from')) {
                $query->where('created_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('created_at', '<=', $request->date_to);
            }

            // Pagination
            $perPage = $request->input('per_page', 10);
            $subscriptions = $query->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'subscriptions' => $subscriptions,
                'filters' => [
                    'status_options' => ['active', 'inactive', 'cancelled'],
                    'payment_status_options' => ['pending', 'completed', 'failed']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch subscriptions'
            ], 500);
        }
    }

    public function getSubscriptionDetails($id)
    {
        try {
            $subscription = Subscription::with(['entreprise', 'plan'])
                ->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'subscription' => $subscription
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Subscription not found'
            ], 404);
        }
    }
}
