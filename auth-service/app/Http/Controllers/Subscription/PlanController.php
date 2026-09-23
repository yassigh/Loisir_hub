<?php

namespace App\Http\Controllers\Subscription;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Validator;


class PlanController extends Controller
{
    // Liste tous les plans (accessible à tous)
    public function index()
    {
        try {
            $plans = SubscriptionPlan::all();
            return response()->json([
                'status' => 'success',
                'plans' => $plans
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch subscription plans'
            ], 500);
        }
    }

    // Créer un nouveau plan (admin seulement)
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'duration_in_days' => 'required|integer|min:1',
                'activities_limit' => 'nullable|integer|min:0',
                'events_limit' => 'nullable|integer|min:0',
                'posts_limit' => 'nullable|integer|min:0',
                'ads_allowed' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $plan = SubscriptionPlan::create($request->all());
            return response()->json([
                'status' => 'success',
                'message' => 'Plan created successfully',
                'plan' => $plan
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create subscription plan'
            ], 500);
        }
    }

    // Afficher un plan spécifique (accessible à tous)
    public function show($id)
    {
        try {
            $plan = SubscriptionPlan::findOrFail($id);
            return response()->json([
                'status' => 'success',
                'plan' => $plan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Plan not found'
            ], 404);
        }
    }

    // Mettre à jour un plan (admin seulement)
    public function update(Request $request, $id)
    {
        try {
            $plan = SubscriptionPlan::findOrFail($id);
            
            $validator = Validator::make($request->all(), [
                'name' => 'string|max:255',
                'description' => 'string',
                'price' => 'numeric|min:0',
                'duration_in_days' => 'integer|min:1',
                'activities_limit' => 'nullable|integer|min:0',
                'events_limit' => 'nullable|integer|min:0',
                'posts_limit' => 'nullable|integer|min:0',
                'ads_allowed' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $plan->update($request->all());
            return response()->json([
                'status' => 'success',
                'message' => 'Plan updated successfully',
                'plan' => $plan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update subscription plan'
            ], 500);
        }
    }

    // Supprimer un plan (admin seulement)
    public function destroy($id)
    {
        try {
            $plan = SubscriptionPlan::findOrFail($id);
            
            // Vérifier si le plan a des abonnements actifs
            if ($plan->subscriptions()->where('status', 'active')->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete plan with active subscriptions'
                ], 400);
            }

            $plan->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Plan deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete subscription plan'
            ], 500);
        }
    }
}
