<?php

namespace App\Http\Controllers;

use App\Jobs\SendRandomEmailJob;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UserEmailController extends Controller
{
    public function sendEmailsToRandomUsers()
    {
        try {
            // 1. Fetch users from API
            $response = Http::timeout(10)->get('https://jsonplaceholder.typicode.com/users');

            if ($response->failed()) {
                Log::error('Failed to fetch users from API', [
                    'status' => $response->status()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch users from API'
                ], 500);
            }

            $users = collect($response->json());

            // Validate we have users
            if ($users->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No users found in API response'
                ], 404);
            }

            // 2. Randomly pick 5 users (if less than 5, take all)
            $users = $users->count() >= 5 ? $users->random(5) : $users;

            // 3. Dispatch queue job for each user
            SendRandomEmailJob::dispatch($users);

            // 4. Return success response with user details
            return response()->json([
                'success' => true,
                'message' => 'Emails queued successfully for ' . $users->count() . ' random users!',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing the request',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
