<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('designers_worklists', function (Blueprint $table) {
            $table->id();
            $table->string('client_name');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // The Designer
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade'); // The Manager/Editor
            $table->string('task_type');
            $table->text('description');
            $table->string('status')->default('Not Done');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('designers_worklists');
    }
};
