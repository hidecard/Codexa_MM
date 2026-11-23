<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CertificateTemplate extends Model
{
    protected $fillable = ['name', 'design_config', 'is_default'];

    protected function casts(): array
    {
        return [
            'design_config' => 'array',
            'is_default' => 'boolean',
        ];
    }

    /**
     * Make this template the single default, clearing any previous default.
     */
    public function makeDefault(): void
    {
        static::query()->where('id', '!=', $this->id)->update(['is_default' => false]);
        $this->update(['is_default' => true]);
    }
}
