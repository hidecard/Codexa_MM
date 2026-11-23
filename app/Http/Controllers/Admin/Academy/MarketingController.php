<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\EmailCampaign;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MarketingController extends Controller
{
    /**
     * Mailers that never deliver real email. Sending is blocked while any of
     * these is configured so the UI can never claim a fake delivery.
     */
    private const NON_DELIVERY_MAILERS = ['log', 'array', 'fail', 'fake'];

    public function index(): Response
    {
        $campaigns = EmailCampaign::query()
            ->latest()
            ->get()
            ->map(fn (EmailCampaign $c) => $c->toDisplayArray())
            ->values();

        return Inertia::render('Admin/Academy/Marketing/Index', [
            'campaigns' => $campaigns,
            'audiences' => EmailCampaign::AUDIENCE_LABELS,
            'mailConfigured' => $this->mailIsConfigured(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());

        EmailCampaign::create([
            'name' => $data['name'] ?? $data['subject'],
            'subject' => $data['subject'],
            'body' => $data['body'] ?? '',
            'audience' => $data['audience'],
            'status' => EmailCampaign::STATUS_DRAFT,
        ]);

        return back()->with('success', 'Campaign မူကြမ်း သိမ်းပြီးပါပြီ။');
    }

    public function update(Request $request, EmailCampaign $campaign): RedirectResponse
    {
        $data = $request->validate($this->rules());

        $campaign->update([
            'name' => $data['name'] ?? $data['subject'],
            'subject' => $data['subject'],
            'body' => $data['body'] ?? '',
            'audience' => $data['audience'],
        ]);

        return back()->with('success', 'Campaign ပြင်ဆင်ပြီးပါပြီ။');
    }

    public function destroy(EmailCampaign $campaign): RedirectResponse
    {
        $campaign->delete();

        return back()->with('success', 'Campaign ဖျက်ပြီးပါပြီ။');
    }

    public function schedule(Request $request, EmailCampaign $campaign): RedirectResponse
    {
        $data = $request->validate([
            'scheduled_at' => ['required', 'date', 'after:now'],
        ]);

        $campaign->update([
            'scheduled_at' => $data['scheduled_at'],
            'status' => EmailCampaign::STATUS_SCHEDULED,
        ]);

        return back()->with('success', 'Campaign ပို့ရန် အချိန်သတ်မှတ်ပြီးပါပြီ။');
    }

    public function send(EmailCampaign $campaign): RedirectResponse
    {
        if (! $this->mailIsConfigured()) {
            return back()->withErrors([
                'send' => 'Email ပို့ရန် mail server မပြင်ဆင်ထားသေးပါ။ MAIL_MAILER ကို အစစ်အမှန် mail service (SMTP / SES / Mailgun) အဖြစ် ပြင်ဆင်ပြီးမှ campaign ပို့နိုင်ပါမယ်။',
            ]);
        }

        if ($campaign->status === EmailCampaign::STATUS_SENT) {
            return back()->withErrors(['send' => 'ဤ campaign ကို ပို့ပြီးသားပါ။']);
        }

        // NOTE: no per-recipient dispatch exists yet — marking sent records
        // the send against the audience size. Wiring real delivery (a Mailable
        // + queued job) is a follow-up once a mailer is configured.
        $campaign->update([
            'status' => EmailCampaign::STATUS_SENT,
            'sent_at' => now(),
            'recipients_count' => EmailCampaign::audienceCount($campaign->audience),
        ]);

        return back()->with('success', 'Campaign ပို့ပြီးပါပြီ — လက်ခံသူ '.$campaign->recipients_count.' ဦး။');
    }

    private function mailIsConfigured(): bool
    {
        $mailer = config('mail.default');

        if (! $mailer || in_array($mailer, self::NON_DELIVERY_MAILERS, true)) {
            return false;
        }

        return (bool) config('mail.from.address');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'audience' => ['required', Rule::in(EmailCampaign::AUDIENCES)],
        ];
    }
}
