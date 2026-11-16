<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ProjectDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $client = $user->client;

        if (! $client) {
            return Inertia::render('Client/Documents/Index', [
                'documents' => collect(),
            ]);
        }

        $documents = ProjectDocument::query()
            ->whereHas('project', fn ($q) => $q->where('client_id', $client->id))
            ->with(['project:id,title', 'uploadedBy:id,name'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Client/Documents/Index', [
            'documents' => $documents,
        ]);
    }

    public function download(Request $request, ProjectDocument $document)
    {
        $this->authorize('view', $document->project);
        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download(
            $document->file_path,
            $document->original_name ?: basename($document->file_path),
        );
    }
}
