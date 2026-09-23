<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $userData = $request->get('user_data');

        if (
           
          
            $userData['user']['type'] === 'admin'
        ) {
            return $next($request);
        }

       }
}