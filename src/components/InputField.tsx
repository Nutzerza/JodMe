// This component is a reusable input field that includes an icon, placeholder text, and handles focus state.

'use client';

import { Input } from '@/components/ui/input';

export default function InputField({
    icon,
    error,
    ...props
}: {
    icon: React.ReactNode;
    error?: boolean;
} & React.ComponentProps<typeof Input>) {

    return (
        <div className={`flex items-center gap-2 px-3 rounded-lg border 
            ${error ? 'border-red-400 focus-within:border-red-400' : 'border-slate-700 focus-within:border-sky-400'}
        `}>
            {icon}
            <Input
                {...props}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:border-0 px-0"
            />
        </div>
    );
}
