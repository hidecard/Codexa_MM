// Helpers for plain fetch() calls against Laravel web routes. Inertia
// router posts handle CSRF internally; fetch needs the XSRF-TOKEN cookie
// sent back as the X-XSRF-TOKEN header.

export function csrfToken(): string | null {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export function jsonHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
    const token = csrfToken();
    if (token) headers['X-XSRF-TOKEN'] = token;
    return headers;
}

export async function postJson(url: string, body: Record<string, unknown> = {}): Promise<Response> {
    return fetch(url, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify(body) });
}

export async function getJson(url: string): Promise<Response> {
    return fetch(url, { headers: { Accept: 'application/json' } });
}
