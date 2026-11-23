<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Whitelisted setting keys with their defaults and groups.
     * Only these keys may ever be written through this controller.
     */
    public static function defaults(): array
    {
        return [
            'platform_name' => ['value' => 'Codexa MM', 'group' => 'general'],
            'support_email' => ['value' => 'support@codexamm.com', 'group' => 'general'],
            'instructor_share_pct' => ['value' => 50, 'group' => 'general'],
            'refund_days' => ['value' => 7, 'group' => 'general'],
            'feature_maintenance' => ['value' => false, 'group' => 'features'],
            'feature_signup' => ['value' => true, 'group' => 'features'],
            'feature_live' => ['value' => true, 'group' => 'features'],
            'feature_certificates' => ['value' => true, 'group' => 'features'],
            'feature_community' => ['value' => true, 'group' => 'features'],
            'gateway_kbz' => ['value' => true, 'group' => 'payments'],
            'gateway_wave' => ['value' => true, 'group' => 'payments'],
            'gateway_cb' => ['value' => true, 'group' => 'payments'],
            'gateway_bank' => ['value' => true, 'group' => 'payments'],
            'email_welcome_subject' => ['value' => 'Codexa MM သို့ ကြိုဆိုပါတယ်, {{name}}!', 'group' => 'email'],
            'email_welcome_body' => ['value' => "မင်္ဂလာပါ {{name}},\n\nCodexa MM မှာ အကောင့် ဖွင့်တာ ကျေးဇူးတင်ပါတယ်။ သင်တန်း တစ်ထောင်ကျော်ထဲက သင့်အတွက် သင့်တော်တာကို စတင် လေ့လာနိုင်ပါပြီ။\n\nLearn · Code · Grow", 'group' => 'email'],
            'email_payment_subject' => ['value' => 'ပေးချေမှု အောင်မြင်ပါပြီ — {{course}}', 'group' => 'email'],
            'email_payment_body' => ['value' => "မင်္ဂလာပါ {{name}},\n\n{{course}} သင်တန်းအတွက် {{amount}} ပေးချေမှု အောင်မြင်ပါပြီ။ ယခု ချက်ချင်း သင်ယူလို့ ရပါပြီ။", 'group' => 'email'],
            'email_certificate_subject' => ['value' => 'ဂုဏ်ယူပါတယ် — {{course}} လက်မှတ် ရရှိပါပြီ', 'group' => 'email'],
            'email_certificate_body' => ['value' => "မင်္ဂလာပါ {{name}},\n\n{{course}} သင်တန်းကို အောင်မြင်စွာ ပြီးဆုံးပြီး လက်မှတ် ရရှိပါပြီ။ လက်မှတ်ကို profile မှာ ဒေါင်းလုဒ် လုပ်နိုင်ပါတယ်။", 'group' => 'email'],
            'email_refund_subject' => ['value' => 'Refund အတည်ပြုပါပြီ — {{course}}', 'group' => 'email'],
            'email_refund_body' => ['value' => "မင်္ဂလာပါ {{name}},\n\n{{course}} အတွက် refund တောင်းခံမှု အတည်ပြုပါပြီ။ ငွေကို ၃-၅ ရက်အတွင်း ပြန်အမ်းပါမယ်။", 'group' => 'email'],
        ];
    }

    public function index(): Response
    {
        $defaults = static::defaults();
        Setting::ensureDefaults($defaults);

        $values = [];
        foreach ($defaults as $key => $definition) {
            $values[$key] = Setting::getValue($key, $definition['value']);
        }

        return Inertia::render('Admin/Settings/Index', [
            'settings' => [
                'platform_name' => $values['platform_name'],
                'support_email' => $values['support_email'],
                'instructor_share_pct' => $values['instructor_share_pct'],
                'refund_days' => $values['refund_days'],
                'feature_maintenance' => $values['feature_maintenance'],
                'feature_signup' => $values['feature_signup'],
                'feature_live' => $values['feature_live'],
                'feature_certificates' => $values['feature_certificates'],
                'feature_community' => $values['feature_community'],
                'gateway_kbz' => $values['gateway_kbz'],
                'gateway_wave' => $values['gateway_wave'],
                'gateway_cb' => $values['gateway_cb'],
                'gateway_bank' => $values['gateway_bank'],
            ],
            'emailTemplates' => [
                'welcome' => ['subject' => $values['email_welcome_subject'], 'body' => $values['email_welcome_body']],
                'payment' => ['subject' => $values['email_payment_subject'], 'body' => $values['email_payment_body']],
                'certificate' => ['subject' => $values['email_certificate_subject'], 'body' => $values['email_certificate_body']],
                'refund' => ['subject' => $values['email_refund_subject'], 'body' => $values['email_refund_body']],
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platform_name' => ['required', 'string', 'max:255'],
            'support_email' => ['required', 'email', 'max:255'],
            'instructor_share_pct' => ['required', 'integer', 'min:0', 'max:100'],
            'refund_days' => ['required', 'integer', 'min:0', 'max:365'],
            'feature_maintenance' => ['sometimes', 'boolean'],
            'feature_signup' => ['sometimes', 'boolean'],
            'feature_live' => ['sometimes', 'boolean'],
            'feature_certificates' => ['sometimes', 'boolean'],
            'feature_community' => ['sometimes', 'boolean'],
            'gateway_kbz' => ['sometimes', 'boolean'],
            'gateway_wave' => ['sometimes', 'boolean'],
            'gateway_cb' => ['sometimes', 'boolean'],
            'gateway_bank' => ['sometimes', 'boolean'],
            'email_templates' => ['sometimes', 'array'],
            'email_templates.welcome.subject' => ['nullable', 'string', 'max:255'],
            'email_templates.welcome.body' => ['nullable', 'string', 'max:5000'],
            'email_templates.payment.subject' => ['nullable', 'string', 'max:255'],
            'email_templates.payment.body' => ['nullable', 'string', 'max:5000'],
            'email_templates.certificate.subject' => ['nullable', 'string', 'max:255'],
            'email_templates.certificate.body' => ['nullable', 'string', 'max:5000'],
            'email_templates.refund.subject' => ['nullable', 'string', 'max:255'],
            'email_templates.refund.body' => ['nullable', 'string', 'max:5000'],
        ]);

        $defaults = static::defaults();

        // Cast explicitly: form-encoded requests deliver ints/booleans as
        // strings, and Setting::setValue infers the stored type from the
        // PHP type, so uncast values would come back as strings.
        Setting::setValue('platform_name', $validated['platform_name'], $defaults['platform_name']['group']);
        Setting::setValue('support_email', $validated['support_email'], $defaults['support_email']['group']);
        Setting::setValue('instructor_share_pct', (int) $validated['instructor_share_pct'], $defaults['instructor_share_pct']['group']);
        Setting::setValue('refund_days', (int) $validated['refund_days'], $defaults['refund_days']['group']);

        foreach (['feature_maintenance', 'feature_signup', 'feature_live', 'feature_certificates', 'feature_community', 'gateway_kbz', 'gateway_wave', 'gateway_cb', 'gateway_bank'] as $key) {
            if (array_key_exists($key, $validated)) {
                Setting::setValue($key, (bool) $validated[$key], $defaults[$key]['group']);
            }
        }

        foreach (['welcome', 'payment', 'certificate', 'refund'] as $template) {
            foreach (['subject', 'body'] as $field) {
                if (isset($validated['email_templates'][$template][$field])) {
                    $key = "email_{$template}_{$field}";
                    Setting::setValue($key, $validated['email_templates'][$template][$field], 'email');
                }
            }
        }

        return redirect()->back()->with('success', 'Settings saved.');
    }
}
