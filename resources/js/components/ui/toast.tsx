import { Toaster } from 'sonner';

export function AppToaster() {
    return (
        <Toaster
            richColors
            position="top-right"
            toastOptions={{
                classNames: {
                    toast: 'rounded-xl border border-slate-200',
                },
            }}
        />
    );
}

export { toast } from 'sonner';
