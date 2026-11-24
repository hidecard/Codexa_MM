<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class IntegrationController extends Controller
{
    /**
     * Service-toggle keys, matching the SERVICES list on the Integrations
     * page. Kept here (not in SettingController) because this page owns
     * these settings.
     */
    public const SERVICE_KEYS = ['kbzpay', 'wavepay', 'cbpay', 'youtube', 'zoom', 'ga'];

    /**
     * Whitelisted integration settings with their defaults and group.
     * Only these keys may ever be written through this controller.
     */
    public static function integrationDefaults(): array
    {
        return [
            'webhook_url' => ['value' => 'https://codexamm.com/webhooks/payments', 'group' => 'integrations'],
            'integration_kbzpay' => ['value' => true, 'group' => 'integrations'],
            'integration_wavepay' => ['value' => true, 'group' => 'integrations'],
            'integration_cbpay' => ['value' => true, 'group' => 'integrations'],
            'integration_youtube' => ['value' => true, 'group' => 'integrations'],
            'integration_zoom' => ['value' => false, 'group' => 'integrations'],
            'integration_ga' => ['value' => false, 'group' => 'integrations'],
        ];
    }

    public function index(Request $request): Response
    {
        $keys = ApiKey::query()
            ->latest()
            ->get()
            ->map(fn (ApiKey $k) => $k->toDisplayArray())
            ->values();

        $defaults = self::integrationDefaults();
        Setting::ensureDefaults($defaults);

        $services = [];
        foreach (self::SERVICE_KEYS as $key) {
            $settingKey = 'integration_'.$key;
            $services[$key] = Setting::getValue($settingKey, $defaults[$settingKey]['value']);
        }

        return Inertia::render('Admin/Academy/Integrations/Index', [
            'keys' => $keys,
            'providers' => ApiKey::PROVIDERS,
            'integrations' => [
                'webhook_url' => Setting::getValue('webhook_url', $defaults['webhook_url']['value']),
                'services' => $services,
            ],
            // The full key is flashed exactly once after creation/regeneration
            // and never appears in the list response.
            'newKey' => $request->session()->get('new_api_key'),
            'newKeyName' => $request->session()->get('new_api_key_name'),
        ]);
    }

    /**
     * Persist the webhook URL and service toggles via the Setting store.
     */
    public function updateSettings(Request $request): RedirectResponse
    {
        $rules = ['webhook_url' => ['nullable', 'url', 'max:2048']];
        foreach (self::SERVICE_KEYS as $key) {
            $rules['services.'.$key] = ['sometimes', 'boolean'];
        }

        $validated = $request->validate($rules);

        if (array_key_exists('webhook_url', $validated)) {
            Setting::setValue('webhook_url', $validated['webhook_url'] ?? '', 'integrations');
        }

        foreach (self::SERVICE_KEYS as $key) {
            if (isset($validated['services'][$key])) {
                Setting::setValue('integration_'.$key, (bool) $validated['services'][$key], 'integrations');
            }
        }

        return back()->with('success', 'Integration settings သိမ်းပြီးပါပြီ။');
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
