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
        Schema::table('content_calendars', function (Blueprint $table) {
            $table->dropForeign(['assignee_id']);
            $table->dropColumn('assignee_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('content_calendars', function (Blueprint $table) {
            $table->unsignedBigInteger('assignee_id')->nullable();
            $table->foreign('assignee_id')->references('id')->on('users')->onDelete('set null');
        });
    }
};
