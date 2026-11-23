<?php

namespace App\Http\Controllers;

use App\Models\CampaignTracking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CampaignTrackingController extends Controller
{
    /** 1x1 transparent GIF, served as the open-tracking pixel. */
    private const PIXEL = "\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x4c\x01\x00\x3b";

    /**
     * Open-tracking pixel. Records the first open only, and only for a
     * valid signed URL. The pixel is always returned, even for a bad
     * signature, so a broken link never shows a broken image in the email.
     */
    public function pixel(Request $request, string $token): Response
    {
        if ($request->hasValidSignature()) {
            CampaignTracking::query()
                ->where('token', $token)
                ->first()
                ?->markOpened();
        }

        return response(self::PIXEL, 200, [
            'Content-Type' => 'image/gif',
            'Content-Length' => (string) strlen(self::PIXEL),
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
        ]);
    }

    /**
     * Click-redirect. The destination is covered by the URL signature, so
     * only links the app generated can redirect; the scheme is still
     * validated as defence in depth. A click also records the open.
     */
    public function click(Request $request, string $token): RedirectResponse
    {
        if (! $request->hasValidSignature()) {
            abort(404);
        }

        $tracking = CampaignTracking::query()->where('token', $token)->firstOrFail();

        $url = $request->query('url');

        if (! is_string($url) || ! preg_match('#^https?://#i', $url)) {
            abort(404);
        }

        $tracking->markClicked();

        return redirect()->away($url);
    }
}
