'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as pdfjsLib from 'pdfjs-dist';
import { usePdfStore } from '../store/usePdfStore';
import { UploadCloud, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Dropzone() {
    const router = useRouter();
    const [isDragActive, setIsDragActive] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        setPdfBytes,
        setPdfDoc,
        setFileName,
        setNumPages,
        setCurrentPage,
        reset,
        loading,
        setLoading
    } = usePdfStore();

    const handlePDFFile = async (file: File) => {
        if (file.type !== 'application/pdf') {
            setErrorMsg('Invalid file format. Please upload a PDF file only.');
            return;
        }
        setErrorMsg('');
        setLoading(true);
        reset();

        try {
            const buffer = await file.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            setPdfBytes(bytes);
            setFileName(file.name);

            // Load PDF via PDF.js worker
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

            const loadingTask = pdfjsLib.getDocument({ data: bytes });
            const doc = await loadingTask.promise;
            setPdfDoc(doc);
            setNumPages(doc.numPages);
            setCurrentPage(1);

            // Programmatic router transition
            router.push('/editor');
        } catch (e) {
            console.error(e);
            setErrorMsg('Error rendering PDF. This file might be password-protected or corrupted.');
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handlePDFFile(e.dataTransfer.files[0]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handlePDFFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full mx-auto flex flex-col gap-3 py-1 select-none transition-all">
            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-14 px-6 rounded-none border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all relative ${isDragActive
                    ? 'border-brand-indigo bg-brand-indigo/5 scale-[1.005]'
                    : 'border-text-primary bg-bg-secondary hover:border-brand-indigo/80 hover:bg-bg-primary/20 shadow-md'
                    }`}
            >
                {/* Visual Technical Coordinates in Corners */}
                <span className="absolute top-2 left-3 font-mono text-[7px] text-text-secondary/40 select-none">Y0: 0.00 // X0: 0.00</span>
                <span className="absolute top-2 right-3 font-mono text-[7px] text-text-secondary/40 select-none">Y0: 0.00 // X1: 1.00</span>
                <span className="absolute bottom-2 left-3 font-mono text-[7px] text-text-secondary/40 select-none">Y1: 1.00 // X0: 0.00</span>
                <span className="absolute bottom-2 right-3 font-mono text-[7px] text-text-secondary/40 select-none">Y1: 1.00 // X1: 1.00</span>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleInputChange}
                    accept="application/pdf"
                />

                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="w-8 h-8 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin" />
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider">COMPILING PDF ENGINE...</span>
                            <span className="text-[9px] font-mono text-text-secondary">ALLOCATING WASM MEMORY SEGMENTS</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-5 w-full">
                        {/* Upload Icon */}
                        <div className={`p-4 rounded-none border border-text-primary bg-bg-primary text-text-primary shadow-[2px_2px_0px_#12100e] transition-all ${isDragActive ? 'translate-x-[0.5px] translate-y-[0.5px] shadow-none' : ''
                            }`}>
                            <UploadCloud size={24} className={isDragActive ? 'animate-bounce' : ''} />
                        </div>

                        <div className="flex flex-col gap-1 w-full text-center">
                            <p className="text-sm font-mono font-bold uppercase tracking-wide text-text-primary">
                                {isDragActive ? '>> RELEASE PDF DATA NOW' : '>> DROP PDF PLAN SHEET OR IMPORT'}
                            </p>
                            <p className="text-[10px] font-mono text-text-secondary max-w-sm px-6 leading-relaxed text-center mx-auto">
                                local environment processes all structures within memory limits (max 50MB).
                            </p>
                        </div>

                        <div className="flex items-center gap-4 text-[9px] font-mono text-text-secondary uppercase border-t border-text-primary/10 pt-5 w-[85%] justify-center select-none">
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-brand-indigo rounded-none" /> Offline Sandbox
                            </span>
                            <span className="w-1 h-1 bg-text-secondary/20 rounded-full" />
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-brand-indigo rounded-none" /> RAM Redactions
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Error alert message popup */}
            {errorMsg && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-brand-danger-light border border-text-primary text-brand-danger rounded-none text-[11px] font-mono uppercase tracking-wide animate-fade-in shadow-[2px_2px_0px_var(--color-brand-danger)]">
                    <ShieldAlert size={13} className="shrink-0 text-brand-danger" />
                    <span>{errorMsg}</span>
                </div>
            )}
        </div>
    );
}
