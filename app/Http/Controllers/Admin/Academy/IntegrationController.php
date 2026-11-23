<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class IntegrationController extends Controller
{
    public function index(Request $request): Response
    {
        $keys = ApiKey::query()
            ->latest()
            ->get()
            ->map(fn (ApiKey $k) => $k->toDisplayArray())
            ->values();

        return Inertia::render('Admin/Academy/Integrations/Index', [
            'keys' => $keys,
            'providers' => ApiKey::PROVIDERS,
            // The full key is flashed exactly once after creation/regeneration
            // and never appears in the list response.
            'newKey' => $request->session()->get('new_api_key'),
            'newKeyName' => $request->session()->get('new_api_key_name'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'provider' => ['required', Rule::in(ApiKey::PROVIDERS)],
        ]);

        $plainKey = 'cmx_live_'.Str::random(32);

        $key = ApiKey::create([
            'name' => $data['name'],
            'provider' => $data['provider'],
            'key_value' => $plainKey,
        ]);

        return back()
            ->with('success', 'API key အသစ် ထုတ်ပြီးပါပြီ — ယခု တစ်ခါသာ မြင်ရပါမယ်။')
            ->with('new_api_key', $plainKey)
            ->with('new_api_key_name', $key->name);
    }

    public function update(Request $request, ApiKey $apiKey): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'provider' => ['required', Rule::in(ApiKey::PROVIDERS)],
        ]);

        $apiKey->update($data);

        return back()->with('success', 'API key ပြင်ဆင်ပြီးပါပြီ။');
    }

    public function destroy(ApiKey $apiKey): RedirectResponse
    {
        $apiKey->delete();

        return back()->with('success', 'API key ဖျက်ပြီးပါပြီ။');
    }

    public function regenerate(ApiKey $apiKey): RedirectResponse
    {
        $plainKey = 'cmx_live_'.Str::random(32);

        $apiKey->update(['key_value' => $plainKey, 'is_active' => true]);

        return back()
            ->with('success', 'API key အသစ် ထုတ်ပြီးပါပြီ — ယခု တစ်ခါသာ မြင်ရပါမယ်။')
            ->with('new_api_key', $plainKey)
            ->with('new_api_key_name', $apiKey->name);
    }

    public function revoke(ApiKey $apiKey): RedirectResponse
    {
        $apiKey->update(['is_active' => false]);

        return back()->with('success', 'API key ပိတ်သိမ်းပြီးပါပြီ။');
    }

    public function reactivate(ApiKey $apiKey): RedirectResponse
    {
        $apiKey->update(['is_active' => true]);

        return back()->with('success', 'API key ပြန်ဖွင့်ပြီးပါပြီ။');
    }
}
