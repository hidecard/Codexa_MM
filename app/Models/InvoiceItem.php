<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['invoice_id', 'description', 'quantity', 'unit_price', 'total', 'position'])]
class InvoiceItem extends Model
{
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'total' => 'decimal:2',
            'position' => 'integer',
        ];
    }
}
