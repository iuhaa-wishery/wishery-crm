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
        // Renaming columns using raw SQL to avoid issues with defaults/doctrine-dbal
        \DB::statement('ALTER TABLE content_calendars CHANGE status updation VARCHAR(255) DEFAULT NULL');
        \DB::statement('ALTER TABLE content_calendars CHANGE caption creative_caption TEXT DEFAULT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('content_calendars', function (Blueprint $table) {
            $table->renameColumn('updation', 'status');
            $table->renameColumn('creative_caption', 'caption');
        });
    }
};
