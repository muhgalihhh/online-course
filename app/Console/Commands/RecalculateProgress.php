<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Enrollment;

class RecalculateProgress extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'progress:recalculate {--enrollment_id=} {--course_id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate enrollment progress based on completed materials';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $enrollmentId = $this->option('enrollment_id');
        $courseId = $this->option('course_id');

        if ($enrollmentId) {
            // Recalculate specific enrollment
            $enrollment = Enrollment::findOrFail($enrollmentId);
            $enrollment->updateProgress();
            $this->info("Recalculated progress for enrollment ID: {$enrollmentId}");
        } elseif ($courseId) {
            // Recalculate all enrollments for a specific course
            $enrollments = Enrollment::where('course_id', $courseId)->get();
            foreach ($enrollments as $enrollment) {
                $enrollment->updateProgress();
            }
            $this->info("Recalculated progress for all enrollments in course ID: {$courseId}");
        } else {
            // Recalculate all enrollments
            $enrollments = Enrollment::all();
            $progressBar = $this->output->createProgressBar($enrollments->count());
            $progressBar->start();

            foreach ($enrollments as $enrollment) {
                $enrollment->updateProgress();
                $progressBar->advance();
            }

            $progressBar->finish();
            $this->newLine();
            $this->info("Recalculated progress for all enrollments");
        }

        return 0;
    }
}
