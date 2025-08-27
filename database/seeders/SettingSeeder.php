<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // General Settings
        $generalSettings = [
            ['key' => 'platform_name', 'value' => 'EduPlatform', 'type' => 'string', 'description' => 'Platform name displayed across the application', 'is_public' => true],
            ['key' => 'platform_description', 'value' => 'Platform kursus online terbaik untuk pembelajaran digital', 'type' => 'string', 'description' => 'Platform description', 'is_public' => true],
            ['key' => 'contact_email', 'value' => 'admin@eduplatform.com', 'type' => 'string', 'description' => 'Main contact email address', 'is_public' => true],
            ['key' => 'support_phone', 'value' => '+62 812-3456-7890', 'type' => 'string', 'description' => 'Support phone number', 'is_public' => true],
            ['key' => 'max_users', 'value' => '10000', 'type' => 'integer', 'description' => 'Maximum number of users allowed', 'is_public' => false],
            ['key' => 'user_verification', 'value' => 'email', 'type' => 'string', 'description' => 'User verification method', 'is_public' => false],
            ['key' => 'auto_approve_users', 'value' => '1', 'type' => 'boolean', 'description' => 'Automatically approve new user registrations', 'is_public' => false],
            ['key' => 'allow_registration', 'value' => '1', 'type' => 'boolean', 'description' => 'Allow new user registrations', 'is_public' => true],
        ];

        foreach ($generalSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                array_merge($setting, ['group' => 'general'])
            );
        }

        // Appearance Settings
        $appearanceSettings = [
            ['key' => 'default_theme', 'value' => 'light', 'type' => 'string', 'description' => 'Default theme for the application', 'is_public' => true],
            ['key' => 'primary_color', 'value' => '#3B82F6', 'type' => 'string', 'description' => 'Primary color for the application', 'is_public' => true],
            ['key' => 'show_logo', 'value' => '1', 'type' => 'boolean', 'description' => 'Show platform logo', 'is_public' => true],
            ['key' => 'sidebar_position', 'value' => 'left', 'type' => 'string', 'description' => 'Position of the sidebar', 'is_public' => true],
            ['key' => 'collapsible_sidebar', 'value' => '1', 'type' => 'boolean', 'description' => 'Allow sidebar to be collapsed', 'is_public' => true],
            ['key' => 'show_breadcrumbs', 'value' => '1', 'type' => 'boolean', 'description' => 'Show breadcrumb navigation', 'is_public' => true],
        ];

        foreach ($appearanceSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                array_merge($setting, ['group' => 'appearance'])
            );
        }

        // Security Settings
        $securitySettings = [
            ['key' => 'password_policy', 'value' => 'medium', 'type' => 'string', 'description' => 'Password strength policy', 'is_public' => false],
            ['key' => 'two_factor_auth', 'value' => '0', 'type' => 'boolean', 'description' => 'Enable two-factor authentication', 'is_public' => false],
            ['key' => 'session_timeout_enabled', 'value' => '1', 'type' => 'boolean', 'description' => 'Enable session timeout', 'is_public' => false],
            ['key' => 'session_timeout_minutes', 'value' => '30', 'type' => 'integer', 'description' => 'Session timeout in minutes', 'is_public' => false],
            ['key' => 'ip_whitelist_enabled', 'value' => '0', 'type' => 'boolean', 'description' => 'Enable IP whitelist', 'is_public' => false],
            ['key' => 'allowed_ips', 'value' => '', 'type' => 'string', 'description' => 'Allowed IP addresses (one per line)', 'is_public' => false],
            ['key' => 'rate_limiting', 'value' => '1', 'type' => 'boolean', 'description' => 'Enable rate limiting', 'is_public' => false],
            ['key' => 'rate_limit_per_minute', 'value' => '60', 'type' => 'integer', 'description' => 'Maximum requests per minute', 'is_public' => false],
        ];

        foreach ($securitySettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                array_merge($setting, ['group' => 'security'])
            );
        }

        // Notification Settings
        $notificationSettings = [
            ['key' => 'notify_new_registration', 'value' => '1', 'type' => 'boolean', 'description' => 'Send notification for new registrations', 'is_public' => false],
            ['key' => 'notify_course_enrollment', 'value' => '1', 'type' => 'boolean', 'description' => 'Send notification for course enrollments', 'is_public' => false],
            ['key' => 'notify_payment_confirmation', 'value' => '1', 'type' => 'boolean', 'description' => 'Send payment confirmation notifications', 'is_public' => false],
            ['key' => 'notify_system_updates', 'value' => '0', 'type' => 'boolean', 'description' => 'Send system update notifications', 'is_public' => false],
            ['key' => 'push_notifications', 'value' => '1', 'type' => 'boolean', 'description' => 'Enable push notifications', 'is_public' => true],
            ['key' => 'sound_alerts', 'value' => '0', 'type' => 'boolean', 'description' => 'Enable sound alerts', 'is_public' => true],
            ['key' => 'notification_retention_days', 'value' => '30', 'type' => 'integer', 'description' => 'Days to retain notifications', 'is_public' => false],
        ];

        foreach ($notificationSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                array_merge($setting, ['group' => 'notifications'])
            );
        }

        // Email Settings
        $emailSettings = [
            ['key' => 'smtp_host', 'value' => 'smtp.gmail.com', 'type' => 'string', 'description' => 'SMTP server host', 'is_public' => false],
            ['key' => 'smtp_port', 'value' => '587', 'type' => 'integer', 'description' => 'SMTP server port', 'is_public' => false],
            ['key' => 'smtp_username', 'value' => 'noreply@eduplatform.com', 'type' => 'string', 'description' => 'SMTP username', 'is_public' => false],
            ['key' => 'smtp_password', 'value' => '', 'type' => 'string', 'description' => 'SMTP password (encrypted)', 'is_public' => false],
            ['key' => 'smtp_use_tls', 'value' => '1', 'type' => 'boolean', 'description' => 'Use TLS for SMTP', 'is_public' => false],
            ['key' => 'email_from_name', 'value' => 'EduPlatform', 'type' => 'string', 'description' => 'Email sender name', 'is_public' => false],
            ['key' => 'email_from_address', 'value' => 'noreply@eduplatform.com', 'type' => 'string', 'description' => 'Email sender address', 'is_public' => false],
            ['key' => 'email_reply_to', 'value' => 'support@eduplatform.com', 'type' => 'string', 'description' => 'Reply-to email address', 'is_public' => false],
            ['key' => 'email_footer', 'value' => '© 2024 EduPlatform. All rights reserved.', 'type' => 'string', 'description' => 'Email footer text', 'is_public' => false],
        ];

        foreach ($emailSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                array_merge($setting, ['group' => 'email'])
            );
        }

        // Advanced Settings
        $advancedSettings = [
            ['key' => 'cache_duration_minutes', 'value' => '60', 'type' => 'integer', 'description' => 'Cache duration in minutes', 'is_public' => false],
            ['key' => 'file_upload_limit_mb', 'value' => '10', 'type' => 'integer', 'description' => 'Maximum file upload size in MB', 'is_public' => false],
            ['key' => 'debug_mode', 'value' => '0', 'type' => 'boolean', 'description' => 'Enable debug mode', 'is_public' => false],
            ['key' => 'maintenance_mode', 'value' => '0', 'type' => 'boolean', 'description' => 'Enable maintenance mode', 'is_public' => false],
            ['key' => 'default_currency', 'value' => 'IDR', 'type' => 'string', 'description' => 'Default currency', 'is_public' => true],
            ['key' => 'payment_gateway', 'value' => 'midtrans', 'type' => 'string', 'description' => 'Payment gateway provider', 'is_public' => false],
            ['key' => 'auto_refund', 'value' => '1', 'type' => 'boolean', 'description' => 'Enable automatic refunds', 'is_public' => false],
        ];

        foreach ($advancedSettings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                array_merge($setting, ['group' => 'advanced'])
            );
        }

        $this->command->info('Settings seeded successfully!');
    }
}