<?php

namespace App\Http\Controllers\Activites;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Image;
use App\Models\ActivitePayant;
use App\Models\Evenement;
use App\Models\Poste;
use App\Models\Publicite;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;


class ImageController extends Controller
{
    public function index()
    {
        return response()->json(['images' => Image::all()]);
    }
    //v3.0
    public function store(Request $request, $type, $id)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,png,jpeg|max:4096'
        ]);

        try {
            $model = $this->getModel($type, $id);
            $fileName = Str::uuid() . '.' . $request->file('image')->getClientOriginalExtension();
            $path = $type . '/' . date('Y/m/d');
            $fullPath = $request->file('image')->storeAs($path, $fileName, 'public');

            if (!$fullPath) {
                throw new \Exception('Failed to store image');
            }

            $image = new Image([
                'url' => $fullPath
            ]);

            $model->images()->save($image);

            // Utiliser les bons chemins pour les URLs
            return response()->json([
                'message' => 'Image ajoutée avec succès',
                'image' => [
                    'id' => $image->id,
                    'path' => $fullPath,
                    'url' => url('/storage/' . $fullPath),
                    'api_url' => url('/api/storage/' . $fullPath)
                ]
            ], 201);
        } catch (\Exception $e) {
            if (isset($fullPath) && Storage::disk('public')->exists($fullPath)) {
                Storage::disk('public')->delete($fullPath);
            }
            return response()->json([
                'message' => 'Erreur lors de l\'upload de l\'image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    private function getModel($type, $id)
    {
        return match ($type) {
            'activites-payantes' => ActivitePayant::findOrFail($id),
            'evenements' => Evenement::findOrFail($id),
            'postes' => Poste::findOrFail($id),
            'publicites' => Publicite::findOrFail($id), // Ajout de la gestion des publicités
            default => throw new \InvalidArgumentException('Type invalide'),
        };
    }
    public function show($id)
    {
        $image = Image::findOrFail($id);
        return response()->json(['image' => $image]);
    }
    public function destroy($id)
    {
        try {
            $image = Image::findOrFail($id);

            // Supprimer le fichier physique
            if (Storage::disk('public')->exists($image->url)) {
                Storage::disk('public')->delete($image->url);
            }

            // Supprimer l'enregistrement
            $image->delete();

            return response()->json(['message' => 'Image supprimée avec succès']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression de l\'image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function serveImage($path)
    {
        // Normaliser le chemin (enlever les éventuels doubles slashes)
        $path = ltrim($path, '/');

        $filePath = storage_path('app/public/' . $path);

        // Vérification plus robuste
        if (!Storage::disk('public')->exists($path)) {
            return response()->json([
                'error' => 'File not found',
                'path' => $filePath,
                'storage_path' => $path
            ], 404);
        }

        return response()->file($filePath, [
            'Content-Type' => mime_content_type($filePath),
            'Content-Disposition' => 'inline',
            'Cache-Control' => 'public, max-age=3600'
        ]);
    }
    //v1.0
    // public function getImagesForEntity($type, $id)
    // {
    //     try {
    //         $model = $this->getModel($type, $id);
    //         $images = $model->images()->get();

    //         return response()->json([
    //             'images' => $images->map(function ($image) {
    //                 return [
    //                     'id' => $image->id,
    //                     'url' => $image->url,
    //                     'full_url' => url('/storage/' . $image->url)
    //                 ];
    //             })
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'Error fetching images',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }
    //v2.0
    public function getImagesForEntity($type, $id)
    {
        try {
            $model = $this->getModel($type, $id);
            $images = $model->images()->get();

            return response()->json([
                'images' => $images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->url,
                        'full_url' => url('/storage/' . $image->url)
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching images',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
