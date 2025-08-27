<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $settings = Setting::getAllGrouped();
        
        // Get current user data for profile settings
        $profileData = [
            'name' => $user->name,
            'email' => $user->email,
            'profile_photo_path' => $user->profile_photo_path,
        ];

        return Inertia::render('admin/settings', [
            'settings' => $settings,
            'profileData' => $profileData,
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
        ]);
    }

    public function update(Request $request)
    {
        $section = $request->input('section');
        
        switch ($section) {
            case 'profile':
                return $this->updateProfile($request);
            case 'password':
                return $this->updatePassword($request);
            case 'general':
                return $this->updateGeneralSettings($request);
            case 'appearance':
                return $this->updateAppearanceSettings($request);
            case 'security':
                return $this->updateSecuritySettings($request);
            case 'notifications':
                return $this->updateNotificationSettings($request);
            case 'email':
                return $this->updateEmailSettings($request);
            case 'advanced':
                return $this->updateAdvancedSettings($request);
            default:
                return $this->updateBulkSettings($request);
        }
    }

    protected function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('profile_photo')) {
            // Delete old photo if exists
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $validated['profile_photo_path'] = $path;
            unset($validated['profile_photo']);
        }

        $user->update($validated);

        return back()->with('success', 'Profile updated successfully');
    }

    protected function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        Auth::user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully');
    }

    protected function updateGeneralSettings(Request $request)
    {
        $validated = $request->validate([
            'platform_name' => ['nullable', 'string', 'max:255'],
            'platform_description' => ['nullable', 'string'],
            'contact_email' => ['nullable', 'email'],
            'support_phone' => ['nullable', 'string', 'max:20'],
            'max_users' => ['nullable', 'integer', 'min:1'],
            'user_verification' => ['nullable', 'in:email,phone,both,none'],
            'auto_approve_users' => ['nullable', 'boolean'],
            'allow_registration' => ['nullable', 'boolean'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value, $this->getSettingType($value), 'general');
        }

        return back()->with('success', 'General settings updated successfully');
    }

    protected function updateAppearanceSettings(Request $request)
    {
        $validated = $request->validate([
            'default_theme' => ['nullable', 'in:light,dark,system'],
            'primary_color' => ['nullable', 'string', 'max:7'],
            'show_logo' => ['nullable', 'boolean'],
            'sidebar_position' => ['nullable', 'in:left,right'],
            'collapsible_sidebar' => ['nullable', 'boolean'],
            'show_breadcrumbs' => ['nullable', 'boolean'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value, $this->getSettingType($value), 'appearance');
        }

        return back()->with('success', 'Appearance settings updated successfully');
    }

    protected function updateSecuritySettings(Request $request)
    {
        $validated = $request->validate([
            'password_policy' => ['nullable', 'in:low,medium,high'],
            'two_factor_auth' => ['nullable', 'boolean'],
            'session_timeout_enabled' => ['nullable', 'boolean'],
            'session_timeout_minutes' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'ip_whitelist_enabled' => ['nullable', 'boolean'],
            'allowed_ips' => ['nullable', 'string'],
            'rate_limiting' => ['nullable', 'boolean'],
            'rate_limit_per_minute' => ['nullable', 'integer', 'min:1', 'max:1000'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value, $this->getSettingType($value), 'security');
        }

        return back()->with('success', 'Security settings updated successfully');
    }

    protected function updateNotificationSettings(Request $request)
    {
        $validated = $request->validate([
            'notify_new_registration' => ['nullable', 'boolean'],
            'notify_course_enrollment' => ['nullable', 'boolean'],
            'notify_payment_confirmation' => ['nullable', 'boolean'],
            'notify_system_updates' => ['nullable', 'boolean'],
            'push_notifications' => ['nullable', 'boolean'],
            'sound_alerts' => ['nullable', 'boolean'],
            'notification_retention_days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value, $this->getSettingType($value), 'notifications');
        }

        return back()->with('success', 'Notification settings updated successfully');
    }

    protected function updateEmailSettings(Request $request)
    {
        $validated = $request->validate([
            'smtp_host' => ['nullable', 'string', 'max:255'],
            'smtp_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'smtp_username' => ['nullable', 'string', 'max:255'],
            'smtp_password' => ['nullable', 'string', 'max:255'],
            'smtp_use_tls' => ['nullable', 'boolean'],
            'email_from_name' => ['nullable', 'string', 'max:255'],
            'email_from_address' => ['nullable', 'email'],
            'email_reply_to' => ['nullable', 'email'],
            'email_footer' => ['nullable', 'string'],
        ]);

        // Handle password encryption
        if (isset($validated['smtp_password'])) {
            $validated['smtp_password'] = encrypt($validated['smtp_password']);
        }

        foreach ($validated as $key => $value) {
            Setting::set($key, $value, $this->getSettingType($value), 'email');
        }

        return back()->with('success', 'Email settings updated successfully');
    }

    protected function updateAdvancedSettings(Request $request)
    {
        $validated = $request->validate([
            'cache_duration_minutes' => ['nullable', 'integer', 'min:0', 'max:10080'],
            'file_upload_limit_mb' => ['nullable', 'integer', 'min:1', 'max:100'],
            'debug_mode' => ['nullable', 'boolean'],
            'maintenance_mode' => ['nullable', 'boolean'],
            'default_currency' => ['nullable', 'in:IDR,USD,EUR,GBP,SGD,MYR'],
            'payment_gateway' => ['nullable', 'in:midtrans,xendit,stripe,paypal'],
            'auto_refund' => ['nullable', 'boolean'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value, $this->getSettingType($value), 'advanced');
        }

        return back()->with('success', 'Advanced settings updated successfully');
    }

    protected function updateBulkSettings(Request $request)
    {
        $settings = $request->input('settings', []);
        
        foreach ($settings as $key => $value) {
            $group = $request->input("groups.{$key}", 'general');
            Setting::set($key, $value, $this->getSettingType($value), $group);
        }

        return back()->with('success', 'Settings updated successfully');
    }

    protected function getSettingType($value)
    {
        if (is_bool($value)) {
            return 'boolean';
        } elseif (is_int($value)) {
            return 'integer';
        } elseif (is_float($value)) {
            return 'float';
        } elseif (is_array($value)) {
            return 'array';
        } else {
            return 'string';
        }
    }

    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}