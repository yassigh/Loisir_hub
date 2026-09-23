<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Entreprise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class AdminController extends Controller
{
    //USER
    public function getAllUsers()
    {
        try {
            $users = User::where('role', '!=', 'admin')->get();
            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function getUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json([
            'user' => $user
        ]);
    }

    public function deleteUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    //ENTREPRISE
    public function getAllEntreprises()
    {
        try {
            $entreprises = Entreprise::all();
            return response()->json($entreprises);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function getEntreprise($id)
    {
        $entreprise = Entreprise::find($id);

        if (!$entreprise) {
            return response()->json(['message' => 'Entreprise not found'], 404);
        }

        return response()->json([
            'entreprise' => $entreprise
        ]);
    }
    public function deleteEntreprise($id)
    {
        $entreprise = Entreprise::find($id);

        if (!$entreprise) {
            return response()->json(['message' => 'Entreprise not found'], 404);
        }

        $entreprise->delete();

        return response()->json([
            'message' => 'Entreprise deleted successfully'
        ]);
    }
    public function updateProfile(Request $request)
    {
        try {
            DB::beginTransaction();
            $user = $request->user();
            Log::info('Admin Update Profile Request:', $request->all());

            // Validation
            $validatedData = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'numTelU' => 'nullable|string|max:10',
                'imageU' => 'nullable|image|mimes:jpg,png,jpeg|max:2048'
            ]);

            // Update fields
            foreach ($validatedData as $field => $value) {
                if ($request->has($field)) {
                    $user->$field = $value;
                }
            }

            // Handle image
            if ($request->hasFile('imageU')) {
                if ($user->imageU) {
                    Storage::disk('public')->delete($user->imageU);
                }
                $path = $request->file('imageU')->store('users', 'public');
                $user->imageU = $path;
            }

            $user->save();
            DB::commit();

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admin Update Profile Error:', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function updateUserRole(Request $request, $id)
    {
        try {
            Log::info('Attempting to update user role', [
                'user_id' => $id,
                'new_role' => $request->role
            ]);

            $request->validate([
                'role' => 'required|in:user,admin'
            ]);

            $user = User::find($id);

            if (!$user) {
                Log::error('User not found', ['id' => $id]);
                return response()->json([
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            // Vérifier que l'admin ne modifie pas son propre rôle
            if ($request->user() && $request->user()->id === $user->id) {
                Log::warning('Admin attempting to modify own role', ['id' => $id]);
                return response()->json([
                    'message' => 'Vous ne pouvez pas modifier votre propre rôle'
                ], 403);
            }

            $oldRole = $user->role;
            $user->role = $request->role;
            $user->save();

            Log::info('User role updated successfully', [
                'user_id' => $id,
                'old_role' => $oldRole,
                'new_role' => $user->role
            ]);

            return response()->json([
                'message' => 'Rôle utilisateur mis à jour avec succès',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating user role:', [
                'user_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la mise à jour du rôle',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
