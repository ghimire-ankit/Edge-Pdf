'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePdfStore, ToolMode, Annotation } from '../store/usePdfStore';
import { RefreshCw, Trash2 } from 'lucide-react';

const getFontInfo = (fontName: string, styles: any, isBoldFromPDF?: boolean, isItalicFromPDF?: boolean) => {
    const styleFont = styles[fontName]?.fontFamily || '';
    const combined = `${fontName} ${styleFont}`.toLowerCase();

    const isBold = isBoldFromPDF || combined.includes('bold') || combined.includes('heavy') || combined.includes('black') || combined.includes('semibold') || combined.includes('medium') || combined.includes('w700') || combined.includes('w800') || combined.includes('w900');
    const isItalic = isItalicFromPDF || combined.includes('italic') || combined.includes('oblique') || combined.includes('slant');

    if (combined.includes('courier') || combined.includes('mono') || combined.includes('consolas') || combined.includes('code')) {
        let pdf = 'Courier';
        if (isBold && isItalic) pdf = 'Courier-BoldOblique';
        else if (isBold) pdf = 'Courier-Bold';
        else if (isItalic) pdf = 'Courier-Oblique';
        return { css: 'monospace', pdf };
    }

    if (combined.includes('sans') || combined.includes('arial') || combined.includes('helvetica') || combined.includes('inter') || combined.includes('roboto')) {
        let pdf = 'Helvetica';
        if (isBold && isItalic) pdf = 'Helvetica-BoldOblique';
        else if (isBold) pdf = 'Helvetica-Bold';
        else if (isItalic) pdf = 'Helvetica-Oblique';
        return { css: 'sans-serif', pdf };
    }

    if (combined.includes('serif') || combined.includes('times') || combined.includes('georgia') || combined.includes('roman') || combined.includes('cambria') || combined.includes('mincho')) {
        let pdf = 'Times-Roman';
        if (isBold && isItalic) pdf = 'Times-BoldItalic';
        else if (isBold) pdf = 'Times-Bold';
        else if (isItalic) pdf = 'Times-Italic';
        return { css: 'serif', pdf };
    }

    let pdf = 'Helvetica';
    if (isBold && isItalic) pdf = 'Helvetica-BoldOblique';
    else if (isBold) pdf = 'Helvetica-Bold';
    else if (isItalic) pdf = 'Helvetica-Oblique';
    return { css: 'sans-serif', pdf };
};

export default function CanvasPage() {
    const {
        pdfDoc,
        currentPage,
        scale,
        toolMode,
        setToolMode,
        annotations,
        setAnnotations,
        addAnnotation,
        updateAnnotation,
        deleteAnnotation,
        selectedAnnoId,
        setSelectedAnnoId,
        extractedTextItems,
        setExtractedTextItems,
        renderingPage,
        setRenderingPage,
        signatureText,
        signatureFont,
        signatureType,
        signatureImageURL
    } = usePdfStore();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

    // Render main page canvas and parse text coordinate positions from PDF.js
    const renderCurrentPage = async () => {
        if (!pdfDoc || !canvasRef.current) return;
        setRenderingPage(true);
        try {
            const page = await pdfDoc.getPage(currentPage);
            const viewport = page.getViewport({ scale });
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (!context) return;

            const dpr = window.devicePixelRatio || 1;
            canvas.width = viewport.width * dpr;
            canvas.height = viewport.height * dpr;
            canvas.style.width = `${viewport.width}px`;
            canvas.style.height = `${viewport.height}px`;

            context.scale(dpr, dpr);
            await page.render({ canvasContext: context, viewport }).promise;

            // Extract existing PDF text items and map their geometries to scale-independent percents!
            const textContent = await page.getTextContent();
            const styles = textContent.styles || {};
            const pageViewport = page.getViewport({ scale: 1.0 }); // base dimensions in points
            const widthPoints = pageViewport.width;
            const heightPoints = pageViewport.height;

            const items = textContent.items.map((item: any, idx: number) => {
                const tx = item.transform[4];
                const ty = item.transform[5];

                // Convert base coordinates using viewport translation
                const [vx, vy] = pageViewport.convertToViewportPoint(tx, ty);
                const fontHeight = Math.abs(item.transform[3]) || 12;

                // Extend padding heights upward and downward to fit descenders/ascenders
                const padH = fontHeight * 0.22;

                // Convert point distances to percentages
                const x = (vx / widthPoints) * 100;
                const y = ((vy - fontHeight - padH) / heightPoints) * 100;
                const w = (item.width / widthPoints) * 100;
                const h = ((fontHeight + 2 * padH) / heightPoints) * 100;

                const fontObj = page.commonObjs.has(item.fontName) ? page.commonObjs.get(item.fontName) : null;
                const isBoldFromPDF = fontObj?.bold === true || fontObj?.black === true || fontObj?.heavy === true || false;
                const isItalicFromPDF = fontObj?.italic === true || false;

                const fontInfo = getFontInfo(item.fontName, styles, isBoldFromPDF, isItalicFromPDF);

                return {
                    id: `txt_${currentPage}_${idx}`,
                    str: item.str,
                    x,
                    y,
                    w: w > 0 ? w : 8,
                    h: h > 0 ? h : 3.5,
                    fontSize: fontHeight,
                    fontName: item.fontName,
                    fontFamily: fontInfo.css,
                    pdfFont: fontInfo.pdf
                };
            }).filter((item: any) => item.str.trim().length > 0);

            setExtractedTextItems(items);
        } catch (e) {
            console.error('Renderer failed:', e);
        } finally {
            setRenderingPage(false);
        }
    };

    useEffect(() => {
        if (pdfDoc) {
            renderCurrentPage();
        }
    }, [pdfDoc, currentPage, scale]);

    // Click on Canvas overlay to paste new element
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (toolMode === 'select' || toolMode === 'edit-text') {
            setSelectedAnnoId(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newAnno: Annotation = {
            id: `anno_${Date.now()}`,
            page: currentPage,
            x: x,
            y: y,
            type: toolMode,
            color: '#1a1714',
            width: 15,
            height: 6
        };

        if (toolMode === 'text') {
            newAnno.text = 'Click to edit text';
            newAnno.fontFamily = 'Outfit';
            newAnno.fontSize = 16;
            newAnno.isEditing = true;
        } else if (toolMode === 'signature') {
            if (signatureType === 'draw' && signatureImageURL) {
                newAnno.type = 'image';
                newAnno.imgSrc = signatureImageURL;
                newAnno.width = 18;
                newAnno.height = 8;
            } else {
                newAnno.text = signatureText || 'Signature';
                newAnno.fontFamily = signatureFont;
                newAnno.fontSize = 24;
                newAnno.color = '#1c1a17';
            }
        } else if (toolMode === 'whiteout') {
            newAnno.text = '';
            newAnno.width = 18;
            newAnno.height = 8;
            newAnno.color = '#ffffff';
        } else if (toolMode === 'rect' || toolMode === 'circle') {
            newAnno.width = 16;
            newAnno.height = 12;
            newAnno.color = '#1a1714';
            newAnno.fillColor = 'transparent';
            newAnno.strokeWidth = 3;
        }

        addAnnotation(newAnno);
        setSelectedAnnoId(newAnno.id);

        if (toolMode === 'signature') {
            setToolMode('select');
        }
    };

    // Drag elements handler
    const handleElementMouseDown = (e: React.MouseEvent, annoId: string) => {
        e.stopPropagation();
        if (toolMode !== 'select') return;

        setSelectedAnnoId(annoId);
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    // Resize elements handler
    const handleResizeMouseDown = (e: React.MouseEvent, annoId: string, annoWidth: number, annoHeight: number) => {
        e.stopPropagation();
        e.preventDefault();
        setSelectedAnnoId(annoId);
        setIsResizing(true);
        setResizeStart({ x: e.clientX, y: e.clientY, w: annoWidth, h: annoHeight });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!selectedAnnoId || (!isDragging && !isResizing)) return;

        const currentAnno = annotations.find(a => a.id === selectedAnnoId);
        if (!currentAnno) return;

        const canvasWrapper = document.querySelector('.page-canvas-wrapper');
        if (!canvasWrapper) return;
        const wrapperRect = canvasWrapper.getBoundingClientRect();

        if (isDragging) {
            const deltaX = ((e.clientX - dragStart.x) / wrapperRect.width) * 100;
            const deltaY = ((e.clientY - dragStart.y) / wrapperRect.height) * 100;

            const nextX = Math.max(0, Math.min(100, currentAnno.x + deltaX));
            const nextY = Math.max(0, Math.min(100, currentAnno.y + deltaY));

            updateAnnotation(selectedAnnoId, { x: nextX, y: nextY });
            setDragStart({ x: e.clientX, y: e.clientY });
        } else if (isResizing) {
            const deltaX = ((e.clientX - resizeStart.x) / wrapperRect.width) * 100;
            const deltaY = ((e.clientY - resizeStart.y) / wrapperRect.height) * 100;

            const nextW = Math.max(3, resizeStart.w + deltaX);
            const nextH = Math.max(2, resizeStart.h + deltaY);

            updateAnnotation(selectedAnnoId, { width: nextW, height: nextH });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragStart, resizeStart, selectedAnnoId, annotations]);

    const selectedAnno = annotations.find(a => a.id === selectedAnnoId);

    return (
        <div className="flex-1 bg-bg-primary overflow-auto flex flex-col items-center justify-center p-10 relative">
            {renderingPage && (
                <div className="absolute top-4 right-4 bg-bg-secondary text-text-primary px-3 py-1.5 rounded border border-border-primary text-xs z-50 flex items-center gap-2 shadow-md">
                    <RefreshCw className="animate-spin" size={12} />
                    Rendering PDF...
                </div>
            )}

            <div
                className="page-canvas-wrapper bg-white shadow-xl relative border border-border-primary mx-auto transition-colors"
                style={{
                    cursor: toolMode === 'edit-text' ? 'text' : (toolMode !== 'select' ? 'crosshair' : 'default')
                }}
            >
                <canvas ref={canvasRef} className="pdf-canvas block max-w-full" />

                {/* Annotation Overlay Wrapper */}
                <div className="absolute inset-0 overflow-hidden" onClick={handleOverlayClick}>
                    {/* Transparent selectors for existing PDF text segments */}
                    {toolMode === 'edit-text' && extractedTextItems.map((item) => {
                        const isEdited = annotations.some(a => a.id === item.id);
                        if (isEdited) return null; // let the annotation list handle it

                        return (
                            <div
                                key={item.id}
                                style={{
                                    position: 'absolute',
                                    left: `${item.x}%`,
                                    top: `${item.y}%`,
                                    width: `${item.w}%`,
                                    height: `${item.h}%`,
                                }}
                                className="hover:border hover:border-brand-indigo hover:bg-brand-indigo/10 rounded transition-all cursor-text z-20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Create a text-edit annotation
                                    const newAnno: Annotation = {
                                        id: item.id,
                                        page: currentPage,
                                        x: item.x,
                                        y: item.y,
                                        width: item.w,
                                        height: item.h,
                                        type: 'text-edit',
                                        originalText: item.str,
                                        text: item.str,
                                        fontSize: item.fontSize,
                                        fontName: item.fontName,
                                        fontFamily: item.fontFamily || 'sans-serif',
                                        pdfFont: item.pdfFont || 'Helvetica',
                                        color: '#1a1714',
                                        isEditing: true
                                    };
                                    addAnnotation(newAnno);
                                    setSelectedAnnoId(item.id);
                                }}
                                title="Click to edit this text segment in-place"
                            />
                        );
                    })}

                    {/* Render general annotations layer */}
                    {annotations
                        .filter((anno) => anno.page === currentPage)
                        .map((anno) => {
                            const isSelected = anno.id === selectedAnnoId;
                            const isTextEdit = anno.type === 'text-edit';
                            return (
                                <div
                                    key={anno.id}
                                    style={{
                                        left: `${anno.x}%`,
                                        top: `${anno.y}%`,
                                        width: isTextEdit ? 'auto' : (anno.width ? `${anno.width}%` : 'auto'),
                                        minWidth: isTextEdit && anno.width ? `${anno.width}%` : undefined,
                                        height: anno.height ? `${anno.height}%` : 'auto',
                                        transform: isTextEdit ? 'none' : 'translate(-50%, -50%)',
                                        fontFamily: anno.fontName ? `"${anno.fontName}", ${anno.fontFamily || 'sans-serif'}, sans-serif` : (anno.fontFamily || 'sans-serif'),
                                        fontWeight: (anno.pdfFont?.toLowerCase().includes('bold') || false) ? 'bold' : 'normal',
                                        fontStyle: (anno.pdfFont?.toLowerCase().includes('italic') || anno.pdfFont?.toLowerCase().includes('oblique') || false) ? 'italic' : 'normal',
                                        fontSize: anno.fontSize ? `${anno.fontSize * scale}px` : undefined,
                                        color: anno.type !== 'whiteout' ? anno.color : undefined,
                                        backgroundColor: (anno.type === 'whiteout' || isTextEdit) ? '#ffffff' : (anno.type === 'rect' || anno.type === 'circle' ? anno.fillColor : undefined),
                                        border: anno.type === 'rect'
                                            ? `${anno.strokeWidth || 3}px solid ${anno.color || '#1a1714'}`
                                            : isTextEdit
                                                ? (isSelected || anno.isEditing ? '1px solid var(--color-brand-indigo)' : '1px solid transparent')
                                                : (anno.type === 'whiteout' ? '1px dashed var(--color-border-primary)' : undefined),
                                        borderRadius: anno.type === 'circle' ? '50%' : undefined,
                                        padding: (anno.type === 'text' || anno.type === 'signature') ? '4px 8px' : '0px',
                                    }}
                                    className={`absolute flex items-center select-none border-dashed transition-all z-30 ${isSelected ? 'ring-2 ring-brand-indigo ring-offset-1 border-solid shadow-md bg-brand-indigo/5' : ''
                                        }`}
                                    onMouseDown={(e) => handleElementMouseDown(e, anno.id)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAnnoId(anno.id);
                                    }}
                                    title={isTextEdit ? "Double-click to edit this text" : undefined}
                                >
                                    {isTextEdit ? (
                                        anno.isEditing ? (
                                            <input
                                                value={anno.text}
                                                autoFocus
                                                onChange={(e) => updateAnnotation(anno.id, { text: e.target.value })}
                                                onBlur={() => updateAnnotation(anno.id, { isEditing: false })}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        updateAnnotation(anno.id, { isEditing: false });
                                                    }
                                                }}
                                                style={{
                                                    fontSize: 'inherit',
                                                    fontFamily: anno.fontName ? `"${anno.fontName}", ${anno.fontFamily || 'sans-serif'}, sans-serif` : (anno.fontFamily || 'sans-serif'),
                                                    fontWeight: 'inherit',
                                                    fontStyle: 'inherit',
                                                    color: 'inherit',
                                                    lineHeight: '1.2',
                                                }}
                                                className="w-full h-full border-none outline-none pl-1 pr-1 bg-transparent select-text text-left whitespace-nowrap p-0 m-0 flex items-center"
                                            />
                                        ) : (
                                            <span
                                                onDoubleClick={(e) => {
                                                    e.stopPropagation();
                                                    updateAnnotation(anno.id, { isEditing: true });
                                                }}
                                                style={{
                                                    fontSize: 'inherit',
                                                    fontFamily: anno.fontName ? `"${anno.fontName}", ${anno.fontFamily || 'sans-serif'}, sans-serif` : (anno.fontFamily || 'sans-serif'),
                                                    fontWeight: 'inherit',
                                                    fontStyle: 'inherit',
                                                    color: 'inherit',
                                                    lineHeight: '1.2',
                                                }}
                                                className="w-full h-full flex items-center pl-1 pr-1 bg-transparent cursor-pointer select-none text-left whitespace-nowrap"
                                            >
                                                {anno.text}
                                            </span>
                                        )
                                    ) : anno.type === 'text' ? (
                                        anno.isEditing ? (
                                            <input
                                                value={anno.text}
                                                autoFocus
                                                onChange={(e) => updateAnnotation(anno.id, { text: e.target.value })}
                                                onBlur={() => updateAnnotation(anno.id, { isEditing: false })}
                                                className="border-none bg-transparent outline-none text-center w-full h-full p-0 m-0"
                                                style={{
                                                    fontSize: 'inherit',
                                                    fontFamily: 'inherit',
                                                    fontWeight: 'inherit',
                                                    fontStyle: 'inherit',
                                                    color: 'inherit',
                                                }}
                                            />
                                        ) : (
                                            <span
                                                onDoubleClick={() => updateAnnotation(anno.id, { isEditing: true })}
                                                className="cursor-pointer font-sans min-w-[20px]"
                                            >
                                                {anno.text}
                                            </span>
                                        )
                                    ) : anno.type === 'signature' ? (
                                        <span className="select-none min-w-[20px]">{anno.text}</span>
                                    ) : anno.type === 'whiteout' ? (
                                        <span className="text-[9px] opacity-35 text-[#000000] pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 white-space-nowrap">
                                            Redaction
                                        </span>
                                    ) : anno.type === 'image' ? (
                                        <img
                                            src={anno.imgSrc}
                                            className="w-full h-full object-contain pointer-events-none"
                                            alt="stamp"
                                        />
                                    ) : (
                                        <div className="w-full h-full pointer-events-none" />
                                    )}

                                    {isSelected && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteAnnotation(anno.id);
                                                }}
                                                className="absolute -top-3.5 -right-3.5 bg-bg-secondary border border-border-primary hover:bg-brand-indigo-light hover:text-brand-indigo rounded-full p-1 text-brand-danger shadow-md cursor-pointer transition-all"
                                                title="Delete Element"
                                            >
                                                <Trash2 size={10} />
                                            </button>

                                            {(anno.type === 'whiteout' || anno.type === 'rect' || anno.type === 'circle' || anno.type === 'image' || isTextEdit) && (
                                                <div
                                                    onMouseDown={(e) => handleResizeMouseDown(e, anno.id, anno.width || 0, anno.height || 0)}
                                                    className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-brand-indigo hover:scale-125 cursor-se-resize rounded-full border border-white"
                                                />
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
