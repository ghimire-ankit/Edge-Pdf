'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Disable SSR for the entire workspace layout using dynamic imports
const EditorWorkspace = dynamic(() => import('../../components/EditorWorkspace'), {
    ssr: false,
    loading: () => (
        <div className="flex h-screen w-screen items-center justify-center bg-bg-primary text-text-primary">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-brand-indigo border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold">Loading Sandbox Editor...</span>
            </div>
        </div>
    )
});

export default function EditorPage() {
    return <EditorWorkspace />;
}
