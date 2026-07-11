'use client';

import React, { useRef, useState, useEffect } from 'react';
import { usePdfStore } from '../store/usePdfStore';
import { X, Pen, Type as TypeIcon, Trash } from 'lucide-react';

export default function SignatureModal() {
    const {
        isSignModalOpen,
        setIsSignModalOpen,
        signatureText,
        setSignatureText,
        signatureFont,
        setSignatureFont,
        setSignatureImageURL,
        setSignatureType,
        setToolMode
    } = usePdfStore();

    const [activeTab, setActiveTab] = useState<'type' | 'draw'>('type');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Canvas drawing helper variables
    const lastX = useRef(0);
    const lastY = useRef(0);

    useEffect(() => {
        if (activeTab === 'draw' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#12100e'; // charcoal pencil
            }
        }
    }, [activeTab, isSignModalOpen]);

    if (!isSignModalOpen) return null;

    // Mouse drawing event listeners
    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        lastX.current = x;
        lastY.current = y;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(lastX.current, lastY.current);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastX.current = x;
        lastY.current = y;
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const applySignature = () => {
        if (activeTab === 'type') {
            if (!signatureText.trim()) return;
            setSignatureType('type');
            setToolMode('signature');
        } else {
            if (!canvasRef.current) return;
            // Check if user drew anything (non-blank check)
            const canvas = canvasRef.current;
            const dataUrl = canvas.toDataURL('image/png');
            setSignatureImageURL(dataUrl);
            setSignatureType('draw');
            setToolMode('signature');
        }
        setIsSignModalOpen(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-bg-secondary rounded-none w-full max-w-[480px] border-2 border-text-primary overflow-hidden transition-all text-text-primary shadow-[4px_4px_0px_#12100e]">

                {/* Header */}
                <div className="px-6 py-4 border-b-2 border-text-primary flex justify-between items-center bg-bg-tertiary">
                    <h3 className="font-serif text-lg font-black tracking-tight uppercase">
                        [ SIGNATURE CALIBRATION ]
                    </h3>
                    <button
                        type="button"
                        onClick={() => setIsSignModalOpen(false)}
                        className="text-text-secondary hover:text-text-primary hover:bg-bg-primary p-1.5 border border-transparent hover:border-text-primary transition-all cursor-pointer rounded-none"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Tab selectors */}
                <div className="flex border-b-2 border-text-primary bg-bg-primary text-xs font-mono font-bold">
                    <button
                        type="button"
                        onClick={() => setActiveTab('type')}
                        className={`flex-1 py-3 text-center border-r-2 border-text-primary cursor-pointer flex items-center justify-center gap-1.5 transition-all ${activeTab === 'type' ? 'bg-brand-indigo text-[#fff] font-extrabold' : 'hover:bg-bg-secondary'
                            }`}
                    >
                        <TypeIcon size={13} />
                        TYPED SIGNATURE
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('draw')}
                        className={`flex-1 py-3 text-center cursor-pointer flex items-center justify-center gap-1.5 transition-all ${activeTab === 'draw' ? 'bg-brand-indigo text-[#fff] font-extrabold' : 'hover:bg-bg-secondary'
                            }`}
                    >
                        <Pen size={13} />
                        DRAW HANDWRITING
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-5">
                    {activeTab === 'type' ? (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono font-black text-text-secondary uppercase tracking-wider">
                                    Type Name (Monospace standard)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={signatureText}
                                    autoFocus
                                    onChange={(e) => setSignatureText(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-bg-primary border-2 border-text-primary rounded-none text-text-primary outline-none focus:bg-bg-secondary font-mono"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono font-black text-text-secondary uppercase tracking-wider">
                                    Cursive Script font family
                                </label>
                                <select
                                    value={signatureFont}
                                    onChange={(e) => setSignatureFont(e.target.value)}
                                    className="w-full px-2.5 py-2 text-sm bg-bg-primary border-2 border-text-primary rounded-none text-text-primary outline-none focus:bg-bg-secondary font-mono"
                                >
                                    <option value="var(--font-caveat)">Caveat (Flowing Cursive)</option>
                                    <option value="var(--font-dancing-script)">Dancing Script (Classic)</option>
                                    <option value="var(--font-reenie-beanie)">Reenie Beanie (Technical Hand)</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-mono font-black text-text-secondary uppercase tracking-wider">
                                    Signature Preview
                                </label>
                                <div
                                    style={{ fontFamily: signatureFont }}
                                    className="w-full p-4 bg-bg-primary border-2 border-text-primary rounded-none text-center text-4xl text-text-primary min-h-[90px] flex items-center justify-center select-none"
                                >
                                    {signatureText || 'Signature'}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-mono font-black text-text-secondary uppercase tracking-wider">
                                        Handwriting Sketch Pad (mouse/touch)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={clearCanvas}
                                        className="text-[9px] font-mono font-bold text-brand-danger flex items-center gap-1 border border-transparent hover:border-brand-danger px-2 py-0.5"
                                    >
                                        <Trash size={10} /> CLEAR PAD
                                    </button>
                                </div>
                                <div className="bg-[#fcfbf9] border-2 border-text-primary relative group rounded-none">
                                    <canvas
                                        ref={canvasRef}
                                        width={428}
                                        height={160}
                                        onMouseDown={handleMouseDown}
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseUp}
                                        className="block cursor-pencil w-full h-[160px]"
                                    />
                                    <div className="absolute bottom-1 right-2 pointer-events-none select-none text-[8px] font-mono text-text-secondary/35 uppercase">
                                        [ Calibrated draw coordinates ]
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t-2 border-text-primary flex justify-end gap-3 bg-bg-tertiary">
                    <button
                        onClick={() => setIsSignModalOpen(false)}
                        className="px-4 py-2 border-2 border-text-primary bg-bg-primary text-text-primary font-mono text-xs font-bold hover:bg-bg-secondary cursor-pointer shadow-[2px_2px_0px_#12100e]"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={applySignature}
                        disabled={activeTab === 'type' ? !signatureText.trim() : false}
                        className="px-5 py-2 border-2 border-text-primary bg-brand-indigo text-[#fff] font-mono text-xs font-bold hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer shadow-[2px_2px_0px_#12100e] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ADD SIGNATURE
                    </button>
                </div>
            </div>
        </div>
    );
}
