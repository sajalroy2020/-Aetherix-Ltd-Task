<?php

namespace App\Jobs;

use App\Mail\RandomUserMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendRandomEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $users;

    public function __construct($users)
    {
        $this->users = $users;
    }

    public function handle()
    {
        foreach ($this->users as $user) {
            Mail::to($user['email'])->send(new RandomUserMail($user));
        }
    }
}
