<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RepairTransactionsTable extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transactions:repair
                            {--diagnose : Only diagnose, don\'t fix}
                            {--force : Skip confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Diagnose and repair the transactions table (fixes auto-increment issues)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🔍 Diagnosing transactions table...');
        $this->newLine();

        // 1. Check table existence
        if (!Schema::hasTable('transactions')) {
            $this->error('❌ Table "transactions" does not exist!');
            return 1;
        }
        $this->info('✅ Table "transactions" exists');

        // 2. Get table status
        $tableStatus = DB::selectOne("SHOW TABLE STATUS LIKE 'transactions'");
        
        if (!$tableStatus) {
            $this->error('❌ Could not get table status');
            return 1;
        }

        $this->table(
            ['Property', 'Value'],
            [
                ['Engine', $tableStatus->Engine ?? 'N/A'],
                ['Rows (approx)', $tableStatus->Rows ?? 'N/A'],
                ['Auto_increment', $tableStatus->Auto_increment ?? 'NULL'],
                ['Data_length', $this->formatBytes($tableStatus->Data_length ?? 0)],
                ['Index_length', $this->formatBytes($tableStatus->Index_length ?? 0)],
            ]
        );
        $this->newLine();

        // 3. Check current max ID
        $maxId = DB::selectOne("SELECT MAX(id) as max_id FROM transactions");
        $currentMaxId = $maxId->max_id ?? 0;
        $this->info("📊 Current MAX(id): " . ($currentMaxId ?: 'No records'));

        // 4. Check auto_increment value
        $currentAutoIncrement = $tableStatus->Auto_increment ?? null;
        $this->info("📊 Current AUTO_INCREMENT: " . ($currentAutoIncrement ?: 'NULL/Unknown'));

        // 5. Identify issues
        $issues = [];
        
        if ($currentAutoIncrement === null) {
            $issues[] = 'AUTO_INCREMENT value is NULL or corrupted';
        } elseif ($currentMaxId > 0 && $currentAutoIncrement <= $currentMaxId) {
            $issues[] = "AUTO_INCREMENT ($currentAutoIncrement) is less than or equal to MAX(id) ($currentMaxId)";
        }

        // 6. Check for virtual columns
        $columns = DB::select("SHOW COLUMNS FROM transactions");
        $virtualColumns = [];
        foreach ($columns as $column) {
            if (isset($column->Extra) && str_contains(strtolower($column->Extra), 'virtual')) {
                $virtualColumns[] = $column->Field;
            }
        }
        
        if (!empty($virtualColumns)) {
            $this->warn('⚠️  Virtual columns detected: ' . implode(', ', $virtualColumns));
            $this->info('   (Virtual columns can sometimes cause auto-increment issues in MySQL)');
        }

        // 7. Check for indexes
        $this->newLine();
        $this->info('📋 Indexes on transactions table:');
        $indexes = DB::select("SHOW INDEX FROM transactions");
        $indexInfo = [];
        foreach ($indexes as $index) {
            $indexInfo[] = [
                'Name' => $index->Key_name,
                'Column' => $index->Column_name,
                'Unique' => $index->Non_unique ? 'No' : 'Yes',
            ];
        }
        $this->table(['Name', 'Column', 'Unique'], $indexInfo);

        $this->newLine();

        if (empty($issues)) {
            $this->info('✅ No obvious issues detected with AUTO_INCREMENT');
            
            if ($this->option('diagnose')) {
                return 0;
            }
            
            if (!$this->option('force') && !$this->confirm('Would you like to repair/optimize the table anyway?')) {
                return 0;
            }
        } else {
            $this->newLine();
            $this->error('❌ Issues detected:');
            foreach ($issues as $issue) {
                $this->line("   - $issue");
            }
        }

        if ($this->option('diagnose')) {
            $this->newLine();
            $this->warn('Diagnose mode - no changes made. Run without --diagnose to fix issues.');
            return 0;
        }

        if (!$this->option('force') && !$this->confirm('Do you want to repair the table?')) {
            $this->info('Cancelled.');
            return 0;
        }

        // Perform repairs
        $this->newLine();
        $this->info('🔧 Repairing transactions table...');

        // Step 1: Calculate correct auto_increment
        $newAutoIncrement = max(1, ($currentMaxId ?? 0) + 1);
        $this->info("   Setting AUTO_INCREMENT to: $newAutoIncrement");

        try {
            // Reset auto_increment
            DB::statement("ALTER TABLE transactions AUTO_INCREMENT = $newAutoIncrement");
            $this->info('   ✅ AUTO_INCREMENT reset successfully');
        } catch (\Exception $e) {
            $this->error('   ❌ Failed to reset AUTO_INCREMENT: ' . $e->getMessage());
        }

        // Step 2: Analyze table
        $this->info('   Running ANALYZE TABLE...');
        try {
            DB::statement("ANALYZE TABLE transactions");
            $this->info('   ✅ ANALYZE TABLE completed');
        } catch (\Exception $e) {
            $this->warn('   ⚠️  ANALYZE TABLE failed: ' . $e->getMessage());
        }

        // Step 3: Optimize table (optional, can help with fragmentation)
        $this->info('   Running OPTIMIZE TABLE (this may take a moment)...');
        try {
            DB::statement("OPTIMIZE TABLE transactions");
            $this->info('   ✅ OPTIMIZE TABLE completed');
        } catch (\Exception $e) {
            $this->warn('   ⚠️  OPTIMIZE TABLE failed: ' . $e->getMessage());
        }

        // Verify the fix
        $this->newLine();
        $this->info('🔍 Verifying repair...');
        
        $newTableStatus = DB::selectOne("SHOW TABLE STATUS LIKE 'transactions'");
        $this->table(
            ['Property', 'Before', 'After'],
            [
                ['Auto_increment', $currentAutoIncrement ?? 'NULL', $newTableStatus->Auto_increment ?? 'NULL'],
            ]
        );

        $this->newLine();
        $this->info('✅ Repair completed!');
        $this->info('   You can now try creating a new transaction.');

        return 0;
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes): string
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
}
