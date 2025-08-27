<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Get a setting value by key
     */
    public static function get(string $key, $default = null)
    {
        $setting = Cache::remember("setting.{$key}", 3600, function () use ($key) {
            return self::where('key', $key)->first();
        });

        if (!$setting) {
            return $default;
        }

        return self::castValue($setting->value, $setting->type);
    }

    /**
     * Set a setting value
     */
    public static function set(string $key, $value, string $type = 'string', string $group = 'general', string $description = null)
    {
        $setting = self::updateOrCreate(
            ['key' => $key],
            [
                'value' => self::prepareValue($value, $type),
                'type' => $type,
                'group' => $group,
                'description' => $description,
            ]
        );

        Cache::forget("setting.{$key}");
        Cache::forget('settings.all');
        Cache::forget("settings.group.{$group}");

        return $setting;
    }

    /**
     * Get all settings grouped by their group
     */
    public static function getAllGrouped($includePrivate = true)
    {
        return Cache::remember($includePrivate ? 'settings.all' : 'settings.public', 3600, function () use ($includePrivate) {
            $query = self::query();
            
            if (!$includePrivate) {
                $query->where('is_public', true);
            }

            return $query->get()->groupBy('group')->map(function ($group) {
                return $group->mapWithKeys(function ($setting) {
                    return [$setting->key => [
                        'value' => self::castValue($setting->value, $setting->type),
                        'type' => $setting->type,
                        'description' => $setting->description,
                        'is_public' => $setting->is_public,
                    ]];
                });
            });
        });
    }

    /**
     * Get settings by group
     */
    public static function getByGroup(string $group, $includePrivate = true)
    {
        return Cache::remember("settings.group.{$group}" . ($includePrivate ? '' : '.public'), 3600, function () use ($group, $includePrivate) {
            $query = self::where('group', $group);
            
            if (!$includePrivate) {
                $query->where('is_public', true);
            }

            return $query->get()->mapWithKeys(function ($setting) {
                return [$setting->key => self::castValue($setting->value, $setting->type)];
            });
        });
    }

    /**
     * Clear all settings cache
     */
    public static function clearCache()
    {
        Cache::flush();
    }

    /**
     * Cast value based on type
     */
    protected static function castValue($value, $type)
    {
        switch ($type) {
            case 'boolean':
            case 'bool':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'integer':
            case 'int':
            case 'number':
                return (int) $value;
            case 'float':
            case 'double':
                return (float) $value;
            case 'json':
            case 'array':
                return json_decode($value, true) ?? [];
            default:
                return $value;
        }
    }

    /**
     * Prepare value for storage
     */
    protected static function prepareValue($value, $type)
    {
        switch ($type) {
            case 'boolean':
            case 'bool':
                return $value ? '1' : '0';
            case 'json':
            case 'array':
                return json_encode($value);
            default:
                return (string) $value;
        }
    }
}