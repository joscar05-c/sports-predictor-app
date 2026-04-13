<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
/* crear seeder */
class BetType extends Model
{
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'name',
    ];

    public function odds(): HasMany
    {
        return $this->hasMany(FixtureOdd::class);
    }
}
