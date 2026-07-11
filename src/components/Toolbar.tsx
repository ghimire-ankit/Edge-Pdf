'use client';

import React, { useRef } from 'react';
import { usePdfStore, ToolMode } from '../store/usePdfStore';
import {
    Move,
    FileText,
    Type,
    Eraser,
    Square,
    Circle as CircleIcon,
    PenTool,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Minus,
    Undo2,
    Redo2
} from 'lucide-react';

export default function Toolbar() {
    const {
        toolMode,
        setToolMode,
        currentPage,
        setCurrentPage,
        numPages,
        scale,
        setScale,
        setIsSignModalOpen,
        addAnnotation,
        setSelectedAnnoId,
        undo,
        redo,
        past,
        future
    } = usePdfStore();

    const stampInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement;
            const isTyping = activeEl && (
                activeEl.tagName === 'INPUT' ||
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.getAttribute('contenteditable') === 'true'
            );
            if (isTyping) return;

            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                undo();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (!event.target?.result) return;

                const newAnno = {
                    id: `anno_${Date.now()}`,
                    page: currentPage,
                    x: 40,
                    y: 40,
                    type: 'image' as ToolMode,
                    imgSrc: event.target.result as string,
                    width: 20,
                    height: 15
                };

                addAnnotation(newAnno);
                setSelectedAnnoId(newAnno.id);
                setToolMode('select');
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const tools = [
        { mode: 'select' as ToolMode, label: 'Pointer', icon: Move, desc: 'Select / Move shape overlays' },
        { mode: 'edit-text' as ToolMode, label: 'Edit Text', icon: FileText, desc: 'Edit original PDF text segments in-place' },
        { mode: 'text' as ToolMode, label: 'Add Text', icon: Type, desc: 'Insert new text blocks' },
        { mode: 'whiteout' as ToolMode, label: 'Redact', icon: Eraser, desc: 'Apply local whiteout redaction blocks' }
    ];

    const shapes = [
        { mode: 'rect' as ToolMode, label: 'Rectangle', icon: Square, desc: 'Draw rectangle outline' },
        { mode: 'circle' as ToolMode, label: 'Circle', icon: CircleIcon, desc: 'Draw oval borders' }
    ];

    return (
        <div className="flex border-b-2 border-text-primary items-center justify-between flex-wrap gap-4 px-6 py-3 bg-bg-secondary sticky top-16 z-40 transition-all select-none">

            {/* Tools Groups */}
            <div className="flex items-center gap-4 flex-wrap">

                {/* Core Actions */}
                <div className="flex items-center bg-bg-primary border-2 border-text-primary p-0.5 gap-0.5 rounded-none shadow-[2px_2px_0px_#12100e]">
                    {tools.map((t) => {
                        const Icon = t.icon;
                        const isActive = toolMode === t.mode;
                        return (
                            <button
                                key={t.mode}
                                onClick={() => setToolMode(t.mode)}
                                title={t.desc}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-none cursor-pointer transition-all select-none border border-transparent ${isActive
                                    ? 'bg-brand-indigo text-bg-primary border-text-primary shadow-none translate-x-[0.5px] translate-y-[0.5px]'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                                    }`}
                            >
                                <Icon size={13} className={isActive ? 'stroke-[2.5px]' : ''} />
                                <span>{t.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Undo / Redo */}
                <div className="flex items-center bg-bg-primary border-2 border-text-primary p-0.5 gap-0.5 rounded-none shadow-[2px_2px_0px_#12100e]">
                    <button
                        onClick={undo}
                        disabled={past.length === 0}
                        title="Undo edit (Ctrl+Z)"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-none cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-tertiary select-none border border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <Undo2 size={13} />
                        <span>Undo</span>
                    </button>
                    <button
                        onClick={redo}
                        disabled={future.length === 0}
                        title="Redo edit (Ctrl+Y)"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-none cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-tertiary select-none border border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <Redo2 size={13} />
                        <span>Redo</span>
                    </button>
                </div>

                {/* Vector Shapes */}
                <div className="flex items-center bg-bg-primary border-2 border-text-primary p-0.5 gap-0.5 rounded-none shadow-[2px_2px_0px_#12100e]">
                    {shapes.map((s) => {
                        const Icon = s.icon;
                        const isActive = toolMode === s.mode;
                        return (
                            <button
                                key={s.mode}
                                onClick={() => setToolMode(s.mode)}
                                title={s.desc}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-none cursor-pointer transition-all select-none border border-transparent ${isActive
                                    ? 'bg-brand-indigo text-bg-primary border-text-primary shadow-none translate-x-[0.5px] translate-y-[0.5px]'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                                    }`}
                            >
                                <Icon size={13} className={isActive ? 'stroke-[2.5px]' : ''} />
                                <span>{s.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Assets Uploads */}
                <div className="flex items-center bg-bg-primary border-2 border-text-primary p-0.5 gap-0.5 rounded-none shadow-[2px_2px_0px_#12100e]">
                    <button
                        onClick={() => setIsSignModalOpen(true)}
                        title="Open handwriting signature dialog window"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-none cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all select-none border border-transparent"
                    >
                        <PenTool size={13} />
                        <span>Sign</span>
                    </button>

                    <button
                        onClick={() => stampInputRef.current?.click()}
                        title="Place custom stamp PNG/JPG image overlay"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-none cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all select-none border border-transparent"
                    >
                        <ImageIcon size={13} />
                        <span>Stamp</span>
                    </button>

                    <input
                        type="file"
                        ref={stampInputRef}
                        className="hidden"
                        onChange={handleStampUpload}
                        accept="image/png, image/jpeg"
                    />
                </div>

            </div>

            {/* Pages Navigation & Scaling */}
            <div className="flex items-center gap-4 flex-wrap">

                {/* Navigation Pagers */}
                <div className="flex items-center bg-bg-primary border-2 border-text-primary p-0.5 gap-0.5 rounded-none shadow-[2px_2px_0px_#12100e]">
                    <button
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className="p-1.5 rounded-none cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Previous Page"
                    >
                        <ChevronLeft size={13} />
                    </button>

                    <span className="text-[10px] font-bold text-text-primary px-2 select-none font-mono min-w-[85px] text-center">
                        SHEET: {currentPage}/{numPages || 1}
                    </span>

                    <button
                        disabled={currentPage >= numPages}
                        onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                        className="p-1.5 rounded-none cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Next Page"
                    >
                        <ChevronRight size={13} />
                    </button>
                </div>

                {/* Scaling Zoom */}
                <div className="flex items-center bg-bg-primary border-2 border-text-primary p-0.5 gap-0.5 rounded-none shadow-[2px_2px_0px_#12100e]">
                    <button
                        disabled={scale <= 0.6}
                        onClick={() => setScale(Math.max(0.5, scale - 0.2))}
                        className="p-1.5 rounded-none cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Zoom Out"
                    >
                        <Minus size={13} />
                    </button>

                    <span className="text-[10px] font-bold text-text-primary w-14 text-center select-none font-mono">
                        SCALE: {Math.round(scale * 100)}%
                    </span>

                    <button
                        disabled={scale >= 2.6}
                        onClick={() => setScale(Math.min(2.5, scale + 0.2))}
                        className="p-1.5 rounded-none cursor-pointer text-text-secondary hover:text-text-primary hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Zoom In"
                    >
                        <Plus size={13} />
                    </button>
                </div>

            </div>

        </div>
    );
}
