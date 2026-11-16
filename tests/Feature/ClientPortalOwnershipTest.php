<?php

use App\Models\Client;
use App\Models\ClientFeedback;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\ProjectDocument;
use App\Models\ProjectMilestone;
use App\Models\ProjectTask;
use App\Models\ProjectUpdate;
use App\Models\Quotation;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function makeClientAccount(string $name): array
{
    $user = User::factory()->create([
        'name' => $name,
        'status' => 'active',
        'email_verified_at' => now(),
    ]);
    $user->assignRole('client');

    $client = Client::query()->create([
        'user_id' => $user->id,
        'company_name' => $name.' Company',
        'company_email' => $user->email,
        'status' => 'active',
    ]);

    return [$user, $client];
}

function makeClientProject(Client $client, string $title, string $status = 'in_progress'): Project
{
    return Project::query()->create([
        'client_id' => $client->id,
        'title' => $title,
        'description' => 'Project description',
        'status' => $status,
    ]);
}

test('client project listing is restricted to the authenticated client and supports search', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    [$user, $client] = makeClientAccount('First Client');
    [, $otherClient] = makeClientAccount('Second Client');
    $owned = makeClientProject($client, 'Owned Website');
    makeClientProject($otherClient, 'Private Website');

    $this->actingAs($user)
        ->get(route('client.projects.index', ['search' => 'Owned']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Client/Projects/Index')
            ->where('projects.total', 1)
            ->where('projects.data.0.id', $owned->id)
            ->where('projects.data.0.title', 'Owned Website'));
});

test('client cannot attach feedback or support tickets to another clients project', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    [$user, $client] = makeClientAccount('First Client');
    [, $otherClient] = makeClientAccount('Second Client');
    $foreignProject = makeClientProject($otherClient, 'Foreign Project', 'completed');

    $this->actingAs($user)
        ->from(route('client.feedback.create'))
        ->post(route('client.feedback.store'), [
            'project_id' => $foreignProject->id,
            'rating' => 5,
            'comment' => 'Should be rejected',
        ])
        ->assertSessionHasErrors('project_id');

    $this->actingAs($user)
        ->from(route('client.support.index'))
        ->post(route('client.support.store'), [
            'project_id' => $foreignProject->id,
            'subject' => 'Unauthorized project ticket',
            'message' => 'Should be rejected',
        ])
        ->assertSessionHasErrors('project_id');

    expect(ClientFeedback::query()->count())->toBe(0)
        ->and(SupportTicket::query()->count())->toBe(0)
        ->and($client->fresh()->projects)->toHaveCount(0);
});

test('client policies deny access to another clients project records', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    [$user, $client] = makeClientAccount('First Client');
    [, $otherClient] = makeClientAccount('Second Client');
    $foreignProject = makeClientProject($otherClient, 'Foreign Project');
    $foreignQuotation = Quotation::query()->create([
        'client_id' => $otherClient->id,
        'quotation_number' => 'Q-'.uniqid(),
        'status' => 'sent',
    ]);
    $foreignInvoice = Invoice::query()->create([
        'client_id' => $otherClient->id,
        'invoice_number' => 'INV-'.uniqid(),
        'due_date' => now()->addDay()->toDateString(),
        'status' => 'sent',
    ]);
    $foreignTicket = SupportTicket::query()->create([
        'client_id' => $otherClient->user_id,
        'project_id' => $foreignProject->id,
        'subject' => 'Foreign ticket',
        'status' => 'open',
        'priority' => 1,
    ]);

    expect($user->can('view', $foreignProject))->toBeFalse()
        ->and($user->can('view', $foreignQuotation))->toBeFalse()
        ->and($user->can('approve', $foreignQuotation))->toBeFalse()
        ->and($user->can('view', $foreignInvoice))->toBeFalse()
        ->and($user->can('pay', $foreignInvoice))->toBeFalse()
        ->and($user->can('view', $foreignTicket))->toBeFalse();
});

test('client can add an update only to an owned project and can reply while support is open', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    [$user, $client] = makeClientAccount('First Client');
    [, $otherClient] = makeClientAccount('Second Client');
    $project = makeClientProject($client, 'Owned Project');
    $foreignProject = makeClientProject($otherClient, 'Foreign Project');
    $ticket = SupportTicket::query()->create([
        'client_id' => $user->id,
        'project_id' => $project->id,
        'subject' => 'Need an update',
        'status' => 'open',
        'priority' => 1,
    ]);

    $this->actingAs($user)
        ->post(route('client.projects.updates.store', $project), ['content' => 'Milestone is ready for review.'])
        ->assertRedirect();

    $this->actingAs($user)
        ->post(route('client.projects.updates.store', $foreignProject), ['content' => 'Should be rejected.'])
        ->assertForbidden();

    $this->actingAs($user)
        ->post(route('client.support.messages.store', $ticket), ['message' => 'Thanks for the update.'])
        ->assertRedirect();

    expect(ProjectUpdate::query()->where('project_id', $project->id)->count())->toBe(1)
        ->and(ProjectUpdate::query()->where('project_id', $foreignProject->id)->count())->toBe(0)
        ->and(SupportTicketMessage::query()->where('ticket_id', $ticket->id)->count())->toBe(1);
});

test('client cannot reply to a closed support ticket', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    [$user, $client] = makeClientAccount('First Client');
    $ticket = SupportTicket::query()->create([
        'client_id' => $user->id,
        'project_id' => makeClientProject($client, 'Owned Project')->id,
        'subject' => 'Closed ticket',
        'status' => 'closed',
        'priority' => 1,
    ]);

    $this->actingAs($user)
        ->post(route('client.support.messages.store', $ticket), ['message' => 'Should be rejected.'])
        ->assertForbidden();

    expect(SupportTicketMessage::query()->where('ticket_id', $ticket->id)->count())->toBe(0);
});

test('client milestone and task details are restricted to owned projects', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    [$user, $client] = makeClientAccount('First Client');
    [, $otherClient] = makeClientAccount('Second Client');
    $project = makeClientProject($client, 'Owned Project');
    $foreignProject = makeClientProject($otherClient, 'Foreign Project');
    $milestone = ProjectMilestone::query()->create(['project_id' => $project->id, 'title' => 'Discovery']);
    $foreignMilestone = ProjectMilestone::query()->create(['project_id' => $foreignProject->id, 'title' => 'Foreign Discovery']);
    $task = ProjectTask::query()->create(['milestone_id' => $milestone->id, 'title' => 'Review requirements']);
    $foreignTask = ProjectTask::query()->create(['milestone_id' => $foreignMilestone->id, 'title' => 'Foreign task']);

    $this->actingAs($user)->get(route('client.milestones.show', $milestone))
        ->assertOk()->assertJsonPath('milestone.id', $milestone->id);
    $this->actingAs($user)->get(route('client.milestones.show', $foreignMilestone))->assertForbidden();
    $this->actingAs($user)->get(route('client.tasks.show', $task))
        ->assertOk()->assertJsonPath('task.id', $task->id);
    $this->actingAs($user)->get(route('client.tasks.show', $foreignTask))->assertForbidden();
});

test('client document downloads are authorized through the owning project', function () {
    Storage::fake('local');
    $this->seed(RolesAndPermissionsSeeder::class);
    [$user, $client] = makeClientAccount('First Client');
    [, $otherClient] = makeClientAccount('Second Client');
    $project = makeClientProject($client, 'Owned Project');
    $foreignProject = makeClientProject($otherClient, 'Foreign Project');
    Storage::disk('local')->put('projects/owned.pdf', 'owned');
    Storage::disk('local')->put('projects/foreign.pdf', 'foreign');
    $document = ProjectDocument::query()->create([
        'project_id' => $project->id,
        'file_path' => 'projects/owned.pdf',
        'file_type' => 'application/pdf',
        'original_name' => 'owned.pdf',
        'file_size' => 5,
        'uploaded_by' => $user->id,
    ]);
    $foreignDocument = ProjectDocument::query()->create([
        'project_id' => $foreignProject->id,
        'file_path' => 'projects/foreign.pdf',
        'file_type' => 'application/pdf',
        'original_name' => 'foreign.pdf',
        'file_size' => 7,
        'uploaded_by' => $user->id,
    ]);

    $this->actingAs($user)->get(route('client.documents.download', $document))
        ->assertDownload('owned.pdf');
    $this->actingAs($user)->get(route('client.documents.download', $foreignDocument))->assertForbidden();
});

test('admins can perform only valid project status transitions', function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $admin = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $admin->assignRole('admin');
    [, $client] = makeClientAccount('Project Client');
    $project = makeClientProject($client, 'Lifecycle Project', 'inquiry');

    $this->actingAs($admin)->post(route('admin.solutions.projects.transition', $project), ['status' => 'reviewing'])
        ->assertRedirect();
    expect($project->fresh()->status)->toBe('reviewing');

    $this->actingAs($admin)->from(route('admin.solutions.projects.index'))
        ->post(route('admin.solutions.projects.transition', $project), ['status' => 'completed'])
        ->assertSessionHasErrors('status');
    expect($project->fresh()->status)->toBe('reviewing');
});
