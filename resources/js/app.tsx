import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { AppToaster } from './components/ui/toast';

createInertiaApp({
    title: (title) => (title ? `${title} · Codexa MM` : 'Codexa MM'),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        createRoot(el).render(
            <>
                <App {...props} />
                <AppToaster />
            </>,
        );
    },
    progress: {
        color: '#2563eb',
    },
});
