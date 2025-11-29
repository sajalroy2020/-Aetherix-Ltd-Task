<?php

use App\Http\Controllers\UserEmailController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/send-random-emails', [UserEmailController::class, 'sendEmailsToRandomUsers']);
