<?php

namespace App\Http\Controllers;

use App\Models\Publicite;
use App\Models\PubliciteImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
class PubliciteController extends Controller
{
    public function store(Request $request)
{
    try {
        // Validate request
        $request->validate([
            'images' => 'required|array|min:1',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'date_debut' => 'required|date|after_or_equal:today',
            'jours' => 'required|integer|min:1',
            'prix' => 'required|numeric|min:0',
            'entreprise_id' => 'required|exists:entreprises,id',
        ]);

        // Create directory if it doesn't exist
        if (!Storage::disk('public')->exists('publicites')) {
            Storage::disk('public')->makeDirectory('publicites');
        }

        // Create publicite
        $publicite = Publicite::create([
            'date_debut' => $request->date_debut,
            'jours' => $request->jours,
            'prix' => $request->prix,
            'entreprise_id' => $request->entreprise_id,
        ]);

        $uploadedImages = [];

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                try {
                    // Generate unique filename
                    $filename = 'pub_' . time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
                    
                    // Store the image
                    $path = $image->storeAs('publicites', $filename, 'public');
                    
                    if (!$path) {
                        throw new \Exception('Failed to store image');
                    }

                    // Create image record
                    $publiciteImage = PubliciteImage::create([
                        'publicite_id' => $publicite->id,
                        'image_path' => $path
                    ]);

                    $uploadedImages[] = [
                        'id' => $publiciteImage->id,
                        'url' => asset('storage/' . $path)
                    ];

                    Log::info('Image uploaded successfully', [
                        'path' => $path,
                        'publicite_id' => $publicite->id
                    ]);

                } catch (\Exception $e) {
                    Log::error('Error uploading image', [
                        'error' => $e->getMessage(),
                        'publicite_id' => $publicite->id
                    ]);
                    throw new \Exception('Error uploading image: ' . $e->getMessage());
                }
            }
        }

        return response()->json([
            'message' => 'Publicité créée avec succès',
            'publicite' => [
                'id' => $publicite->id,
                'date_debut' => $publicite->date_debut,
                'jours' => $publicite->jours,
                'prix' => $publicite->prix,
                'entreprise_id' => $publicite->entreprise_id,
                'images' => $uploadedImages
            ]
        ], 201);

    } catch (\Exception $e) {
        Log::error('Error creating publicite', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'message' => 'Erreur lors de la création de la publicité',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function getAllImages()
{
    try {
        // Get all images with their publicite information
        $images = PubliciteImage::with(['publicite' => function($query) {
            $query->select('id', 'date_debut', 'jours', 'prix', 'entreprise_id');
        }])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function($image) {
            return [
                'id' => $image->id,
                'url' => asset('storage/' . $image->image_path),
                'publicite_id' => $image->publicite_id,
                'date_debut' => $image->publicite->date_debut,
                'jours' => $image->publicite->jours,
                'prix' => $image->publicite->prix,
                'created_at' => $image->created_at->format('Y-m-d H:i:s')
            ];
        });

        // Log the count for debugging
        Log::info('Found publicite images:', [
            'count' => $images->count(),
            'first_image' => $images->first()
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $images,
            'count' => $images->count()
        ]);

    } catch (\Exception $e) {
        Log::error('Error fetching publicite images:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'status' => 'error',
            'message' => 'Erreur lors de la récupération des images',
            'error' => $e->getMessage()
        ], 500);
    }
}
    public function getActivePublicites()
    {
        try {
            $now = Carbon::now();
            $publicites = Publicite::with('images')
                ->whereDate('date_debut', '<=', $now)
                ->whereRaw('DATE_ADD(date_debut, INTERVAL jours DAY) >= ?', [$now])
                ->get()
                ->map(function ($publicite) {
                    return [
                        'id' => $publicite->id,
                        'images' => $publicite->images->map(function ($image) {
                            return [
                                'id' => $image->id,
                                'url' => asset('storage/' . $image->image_path)
                            ];
                        })
                    ];
                });

            return response()->json($publicites);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des publicités',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}