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
        Schema::create('daily_worksheet_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('client_name_enabled')->default(false);
            $table->boolean('task_type_enabled')->default(false);
            $table->boolean('status_enabled')->default(false);
            $table->boolean('file_name_enabled')->default(false);
            $table->boolean('drive_link_enabled')->default(false);
            $table->boolean('project_enabled')->default(false);
            $table->text('task_type_options')->nullable(); // Comma separated
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_worksheet_settings');
    }
};
