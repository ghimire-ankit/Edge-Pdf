'use client';

import React from 'react';
import { usePdfStore } from '../store/usePdfStore';
import { Layers, Trash2, Sliders, Type, HelpCircle, PenTool, Hash } from 'lucide-react';

const FONTS = [
    { name: 'Outfit (Sans)', value: 'Outfit' },
    { name: 'Inter (Sans)', value: 'Inter' },
    { name: 'Caveat (Signature)', value: 'Caveat' },
    { name: 'Dancing Script (Signature)', value: 'Dancing Script' },
    { name: 'Reenie Beanie (Signature)', value: 'Reenie Beanie' }
];

export default function SidebarRight() {
    const {
        annotations,
        selectedAnnoId,
        updateAnnotation,
        deleteAnnotation
    } = usePdfStore();

    const selectedAnno = annotations.find(a => a.id === selectedAnnoId);

    const handleColorChange = (colorHex: string) => {
        if (!selectedAnnoId) return;
        updateAnnotation(selectedAnnoId, { color: colorHex });
    };

    return (
        <aside className="w-[280px] bg-bg-secondary border-l-2 border-text-primary flex flex-col overflow-y-auto h-full shrink-0 transition-all">
            {/* Title */}
            <div className="px-5 py-4 border-b-2 border-text-primary bg-bg-secondary sticky top-0 z-10 shrink-0">
                <h4 className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 select-none">
                    <Sliders size={13} className="text-brand-indigo" /> [ PROPERTIES INSPECTION ]
                </h4>
                <p className="text-[9px] font-mono text-text-secondary mt-0.5 select-none leading-relaxed uppercase">
                    CALIBRATE SELECTED COMPONENT GEOMETRY
                </p>
            </div>

            <div className="flex-1 p-5 flex flex-col gap-5 bg-bg-primary/20 draft-grid">
                {selectedAnno ? (
                    <div className="flex flex-col gap-5 animate-fade-in">
                        {/* Annotation Type Badge */}
                        <div className="flex flex-col gap-1.5 pb-2.5 border-b border-text-primary/10">
                            <span className="text-[9px] bg-brand-indigo text-bg-primary px-2.5 py-1 rounded-none font-mono font-bold uppercase tracking-widest self-start select-none shadow-[2px_2px_0px_#12100e] border border-text-primary">
                                OVERLAY: {selectedAnno.type}
                            </span>
                        </div>

                        {/* In-place edit or custom text overlays */}
                        {(selectedAnno.type === 'text' || selectedAnno.type === 'signature' || selectedAnno.type === 'text-edit') && (
                            <div className="flex flex-col gap-4 bg-bg-secondary border-2 border-text-primary p-4 rounded-none shadow-[2px_2px_0px_#12100e]">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                                        <Type size={11} className="text-brand-indigo font-black" /> [ TEXT CONTENT ]
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedAnno.text || ''}
                                        onChange={(e) => updateAnnotation(selectedAnno.id, { text: e.target.value })}
                                        className="w-full px-3 py-1.5 text-xs font-mono bg-bg-primary border-2 border-text-primary rounded-none text-text-primary outline-none focus:bg-bg-tertiary transition-all"
                                    />
                                </div>

                                {selectedAnno.type !== 'text-edit' && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-wider">
                                            [ FONT FAMILY ]
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedAnno.fontFamily || 'Outfit'}
                                                onChange={(e) => updateAnnotation(selectedAnno.id, { fontFamily: e.target.value })}
                                                className="w-full px-3 py-1.5 text-xs font-mono bg-bg-primary border-2 border-text-primary rounded-none text-text-primary outline-none focus:bg-bg-tertiary transition-all cursor-pointer"
                                            >
                                                {FONTS.map(f => (
                                                    <option key={f.value} value={f.value}>{f.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[9px] font-mono font-bold text-text-secondary uppercase tracking-wider">
                                        <span>FONT SIZE</span>
                                        <span className="text-text-primary font-mono bg-bg-primary px-1.5 py-0.5 border border-text-primary/20 text-[9px]">
                                            {selectedAnno.fontSize || 16}PX
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="8"
                                        max="72"
                                        value={selectedAnno.fontSize || 16}
                                        onChange={(e) => updateAnnotation(selectedAnno.id, { fontSize: parseInt(e.target.value) })}
                                        className="w-full accent-brand-indigo cursor-ew-resize h-1.5 bg-bg-tertiary rounded-none border border-text-primary"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Shape Border Properties */}
                        {(selectedAnno.type === 'rect' || selectedAnno.type === 'circle') && (
                            <div className="flex flex-col gap-4 bg-bg-secondary border-2 border-text-primary p-4 rounded-none shadow-[2px_2px_0px_#12100e] animate-fade-in">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-[9px] font-mono font-bold text-text-secondary uppercase tracking-wider">
                                        <span>STROKE WEIGHT</span>
                                        <span className="text-text-primary font-mono bg-bg-primary px-1.5 py-0.5 border border-text-primary/20 text-[9px]">
                                            {selectedAnno.strokeWidth || 3}PX
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="15"
                                        value={selectedAnno.strokeWidth || 3}
                                        onChange={(e) => updateAnnotation(selectedAnno.id, { strokeWidth: parseInt(e.target.value) })}
                                        className="w-full accent-brand-indigo cursor-ew-resize h-1.5 bg-bg-tertiary rounded-none border border-text-primary"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-wider">
                                        [ FILL COLOR ]
                                    </label>
                                    <select
                                        value={selectedAnno.fillColor || 'transparent'}
                                        onChange={(e) => updateAnnotation(selectedAnno.id, { fillColor: e.target.value })}
                                        className="w-full px-3 py-1.5 text-xs font-mono bg-bg-primary border-2 border-text-primary rounded-none text-text-primary outline-none focus:bg-bg-tertiary transition-all cursor-pointer"
                                    >
                                        <option value="transparent">NONE (TRANSPARENT)</option>
                                        <option value="rgba(92, 98, 214, 0.1)">CYAN DRAFT SHADING</option>
                                        <option value="rgba(0, 0, 0, 0.1)">GRAY MASK COVER</option>
                                        <option value="#cc5a37">SOLID TERRACOTTA</option>
                                        <option value="#ffffff">SOLID WHITE</option>
                                        <option value="#a83232">SOLID CRIMSON</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Color Swatch palette selection */}
                        {selectedAnno.type !== 'whiteout' && selectedAnno.type !== 'image' && (
                            <div className="flex flex-col gap-2.5 bg-bg-secondary border-2 border-text-primary p-4 rounded-none shadow-[2px_2px_0px_#12100e]">
                                <label className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-wider">
                                    [ STROKE / DRAW INK ]
                                </label>
                                <div className="flex gap-2">
                                    {['#12100e', '#cc5a37', '#a83232', '#2daf4b', '#dfa82c'].map((colorHex) => (
                                        <button
                                            key={colorHex}
                                            style={{ backgroundColor: colorHex }}
                                            onClick={() => handleColorChange(colorHex)}
                                            className={`w-6 h-6 rounded-none cursor-pointer transition-all border-2 border-text-primary ${selectedAnno.color === colorHex
                                                ? 'scale-105 shadow-[1.5px_1.5px_0px_#cc5a37]'
                                                : 'hover:scale-105'
                                                }`}
                                            title={colorHex}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Coordinates Placement */}
                        <div className="flex flex-col gap-2 bg-bg-secondary border-2 border-text-primary p-4 rounded-none shadow-[2px_2px_0px_#12100e]">
                            <label className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1 select-none">
                                <Hash size={11} className="text-brand-indigo" /> [ METADATA MATRIX ]
                            </label>
                            <div className="grid grid-cols-2 gap-2 text-[9px] leading-relaxed text-text-secondary font-mono">
                                <div className="bg-bg-primary border border-text-primary/10 px-2 py-1 select-none">
                                    <div className="font-bold text-text-primary text-[8px] uppercase tracking-wider opacity-60">X_COORD</div>
                                    <div>{Math.round(selectedAnno.x)}%</div>
                                </div>
                                <div className="bg-bg-primary border border-text-primary/10 px-2 py-1 select-none">
                                    <div className="font-bold text-text-primary text-[8px] uppercase tracking-wider opacity-60">Y_COORD</div>
                                    <div>{Math.round(selectedAnno.y)}%</div>
                                </div>
                                <div className="bg-bg-primary border border-text-primary/10 px-2 py-1 select-none">
                                    <div className="font-bold text-text-primary text-[8px] uppercase tracking-wider opacity-60">W_COORD</div>
                                    <div>{selectedAnno.width ? `${Math.round(selectedAnno.width)}%` : 'AUTO'}</div>
                                </div>
                                <div className="bg-bg-primary border border-text-primary/10 px-2 py-1 select-none">
                                    <div className="font-bold text-text-primary text-[8px] uppercase tracking-wider opacity-60">H_COORD</div>
                                    <div>{selectedAnno.height ? `${Math.round(selectedAnno.height)}%` : 'AUTO'}</div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => deleteAnnotation(selectedAnno.id)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono font-bold rounded-none cursor-pointer bg-brand-danger-light text-brand-danger border-2 border-brand-danger hover:bg-brand-danger hover:text-bg-primary transition-all shadow-[2px_2px_0px_var(--color-brand-danger)]"
                        >
                            <Trash2 size={13} /> REMOVE DRAWING
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary py-16 gap-6 px-1 animate-fade-in select-none">
                        <div className="flex flex-col items-center gap-2">
                            <Layers size={28} className="opacity-25 text-brand-indigo" />
                            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-primary">NO OVERLAY SELECTED</p>
                            <p className="text-[9px] font-mono leading-relaxed max-w-[200px] text-text-secondary uppercase">
                                Click design shapes on board to inspect metrics.
                            </p>
                        </div>

                        <div className="w-full border-t border-text-primary border-dashed pt-5 flex flex-col gap-2 text-left">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-text-primary">[ DRAFTING NOTES ]</span>
                            <ul className="text-[9px] font-mono text-text-secondary flex flex-col gap-2 leading-relaxed uppercase">
                                <li className="flex items-start gap-1">
                                    <span>▪</span> Click and drag to position whiteout redactions.
                                </li>
                                <li className="flex items-start gap-1">
                                    <span>▪</span> Align font layers using matching sizes.
                                </li>
                                <li className="flex items-start gap-1">
                                    <span>▪</span> Canvas updates process locally in RAM.
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
