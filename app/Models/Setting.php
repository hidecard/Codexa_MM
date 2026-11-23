<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'group'];

    /**
     * Read a setting, decoded according to its stored type.
     * Returns $default when the key does not exist.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = static::query()->where('key', $key)->first();

        if (! $setting) {
            return $default;
        }

        return static::decode($setting->value, $setting->type);
    }

    /**
     * Write a setting, encoding the value and inferring its type.
     */
    public static function setValue(string $key, mixed $value, string $group = 'general'): static
    {
        return static::query()->updateOrCreate(
            ['key' => $key],
            [
                'value' => static::encode($value),
                'type' => static::inferType($value),
                'group' => $group,
            ],
        );
    }

    /**
     * Ensure every key in $defaults exists, creating missing ones.
     * $defaults is [key => ['value' => mixed, 'group' => string]].
     */
    public static function ensureDefaults(array $defaults): void
    {
        $existing = static::query()->whereIn('key', array_keys($defaults))->pluck('key')->all();

        foreach ($defaults as $key => $definition) {
            if (! in_array($key, $existing, true)) {
                static::setValue($key, $definition['value'], $definition['group'] ?? 'general');
            }
        }
    }

    /**
     * Read all settings of a group as [key => decoded value].
     */
    public static function valuesForGroup(string $group): array
    {
        return static::query()->where('group', $group)->get()
            ->mapWithKeys(fn (Setting $setting) => [
                $setting->key => static::decode($setting->value, $setting->type),
            ])->all();
    }

    protected static function inferType(mixed $value): string
    {
        if (is_bool($value)) {
            return 'boolean';
        }

        if (is_int($value)) {
            return 'integer';
        }

        if (is_array($value)) {
            return 'json';
        }

        return 'string';
    }

    protected static function encode(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        if (is_array($value)) {
            return json_encode($value);
        }

        return (string) $value;
    }

    protected static function decode(?string $value, string $type): mixed
    {
        return match ($type) {
            'boolean' => $value === '1' || $value === 'true',
            'integer' => $value === null ? null : (int) $value,
            'json' => $value === null ? null : json_decode($value, true),
            default => $value,
        };
    }
}
