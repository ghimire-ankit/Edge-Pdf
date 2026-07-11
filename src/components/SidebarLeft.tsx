'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePdfStore } from '../store/usePdfStore';

interface ThumbnailProps {
    pdfDoc: any;
    pageNum: number;
}

function PageThumbnailCanvas({ pdfDoc, pageNum }: ThumbnailProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const renderPreview = async () => {
            if (!pdfDoc || !canvasRef.current) return;
            try {
                const page = await pdfDoc.getPage(pageNum);
                if (!isMounted) return;

                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                if (!context) return;

                // Render at a small scale for thumbnail preview (~0.2x scale)
                const viewport = page.getViewport({ scale: 0.22 });
                const dpr = window.devicePixelRatio || 1;

                canvas.width = viewport.width * dpr;
                canvas.height = viewport.height * dpr;
                canvas.style.width = `${viewport.width}px`;
                canvas.style.height = `${viewport.height}px`;

                context.scale(dpr, dpr);

                await page.render({ canvasContext: context, viewport }).promise;
                if (isMounted) setLoading(false);
            } catch (e) {
                console.error('Thumbnail page preview render failed:', e);
            }
        };

        renderPreview();
        return () => {
            isMounted = false;
        };
    }, [pdfDoc, pageNum]);

    return (
        <div className="relative w-full h-full flex items-center justify-center p-1.5 bg-[#FAF9F6] dark:bg-zinc-900 transition-colors">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-tertiary select-none">
                    <div className="w-5 h-5 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            <canvas ref={canvasRef} className="max-w-full max-h-full block border border-border-primary/50 shadow-xs" />
        </div>
    );
}

export default function SidebarLeft() {
    const {
        pdfDoc,
        numPages,
        currentPage,
        setCurrentPage
    } = usePdfStore();

    const pagesArray = Array.from({ length: numPages }, (_, i) => i + 1);

    return (
        <aside className="w-[240px] bg-bg-secondary border-r-2 border-text-primary flex flex-col h-full shrink-0 transition-colors">
            <div className="px-5 py-4 border-b-2 border-text-primary bg-bg-secondary select-none">
                <h3 className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider">
                    [ SHEETS INDEX ]
                </h3>
                <p className="text-[10px] font-mono text-text-secondary mt-0.5">
                    RECORDS: {numPages} FILE_PAGES
                </p>
            </div>

            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-5 bg-bg-primary/45 draft-grid">
                {pagesArray.map((pageNum) => (
                    <div
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-full aspect-[1/1.41] bg-bg-secondary border-2 cursor-pointer overflow-hidden relative flex flex-col transition-all group select-none ${currentPage === pageNum
                            ? 'border-brand-indigo shadow-none translate-x-[1px] translate-y-[1px]'
                            : 'border-text-primary shadow-[2.5px_2px_0px_0px_#12100e] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]'
                            }`}
                    >
                        {/* The real PDF rendered page canvas */}
                        <div className="flex-1 overflow-hidden flex items-center justify-center bg-bg-tertiary">
                            {pdfDoc ? (
                                <PageThumbnailCanvas pdfDoc={pdfDoc} pageNum={pageNum} />
                            ) : (
                                <span className="text-[10px] font-mono font-bold text-text-secondary">PAGE {pageNum}</span>
                            )}
                        </div>

                        {/* Bottom metadata tag */}
                        <div className="h-6.5 shrink-0 bg-bg-secondary border-t border-text-primary/10 px-2 flex items-center justify-between text-[9px] font-mono font-bold text-text-secondary uppercase select-none group-hover:bg-brand-indigo-light/20 transition-colors">
                            <span>SHT: {pageNum}</span>
                            <span>{pageNum}/{numPages}</span>
                        </div>
                    </div>
                ))}

                {pagesArray.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-text-secondary select-none">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider">No Sheets Loaded</p>
                        <p className="text-[9px] font-mono mt-1 leading-relaxed max-w-[140px]">Import PDF to populate local drawer.</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
