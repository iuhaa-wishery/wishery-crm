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
        Schema::create('content_calendars', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('assignee_id')->nullable();
            $table->string('creative_uid')->unique(); // Auto-generated
            $table->date('date');
            $table->string('creative_type')->nullable();
            $table->string('status')->default('pending');
            $table->string('drive_link')->nullable();
            $table->string('thumbnail_link')->nullable();
            $table->text('caption')->nullable();
            $table->timestamps();

            $table->foreign('project_id')->references('id')->on('projects')->onDelete('set null');
            $table->foreign('assignee_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_calendars');
    }
};
