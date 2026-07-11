'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePdfStore } from '../store/usePdfStore';
import SidebarLeft from './SidebarLeft';
import Toolbar from './Toolbar';
import CanvasPage from './CanvasPage';
import SidebarRight from './SidebarRight';
import Dropzone from './Dropzone';
import SignatureModal from './SignatureModal';
import { Sparkles, Download, FileImage, ArrowLeft } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function EditorWorkspace() {
    const router = useRouter();

    const {
        pdfBytes,
        fileName,
        reset,
        loading,
        setLoading,
        annotations
    } = usePdfStore();

    const handleExit = () => {
        if (confirm('Are you sure you want to exit? Unsaved annotations will be lost.')) {
            reset();
            router.push('/');
        }
    };

    const handlePDFDownload = async () => {
        if (!pdfBytes) return;
        setLoading(true);
        try {
            const loadedPdfDoc = await PDFDocument.load(pdfBytes);
            const pages = loadedPdfDoc.getPages();

            for (const anno of annotations) {
                const pdfPage = pages[anno.page - 1];
                if (!pdfPage) continue;

                const { width, height } = pdfPage.getSize();

                const pointX = (anno.x / 100) * width;
                let pointY = height - ((anno.y / 100) * height);
                const pointW = (anno.width ? (anno.width / 100) * width : 0);
                const pointH = (anno.height ? (anno.height / 100) * height : 0);

                const hexToRgb = (hex: string) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                        r: parseInt(result[1], 16) / 255,
                        g: parseInt(result[2], 16) / 255,
                        b: parseInt(result[3], 16) / 255
                    } : { r: 0, g: 0, b: 0 };
                };

                const strokeColor = hexToRgb(anno.color || '#1a1714');

                if (anno.type === 'text-edit') {
                    const textBlockY = height - ((anno.y / 100) * height) - pointH;

                    pdfPage.drawRectangle({
                        x: pointX,
                        y: textBlockY,
                        width: pointW,
                        height: pointH,
                        color: rgb(1, 1, 1)
                    });

                    let textFont;
                    try {
                        const standardFontName = anno.pdfFont || 'Helvetica';
                        textFont = await loadedPdfDoc.embedFont(standardFontName);
                    } catch (e) {
                        textFont = await loadedPdfDoc.embedFont(StandardFonts.Helvetica);
                    }

                    pdfPage.drawText(anno.text || '', {
                        x: pointX,
                        y: textBlockY + (pointH * 0.153),
                        size: (anno.fontSize || 12) * 0.95,
                        font: textFont,
                        color: rgb(strokeColor.r, strokeColor.g, strokeColor.b)
                    });
                } else if (anno.type === 'text' || anno.type === 'signature') {
                    let fontRef;
                    if (anno.fontFamily?.includes('Caveat') || anno.fontFamily?.includes('Dancing') || anno.fontFamily?.includes('Beanie')) {
                        fontRef = await loadedPdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);
                    } else {
                        fontRef = await loadedPdfDoc.embedFont(StandardFonts.Helvetica);
                    }

                    const txtColor = hexToRgb(anno.color || '#1a1714');
                    pdfPage.drawText(anno.text || '', {
                        x: pointX - ((anno.text || '').length * (anno.fontSize || 16) * 0.18),
                        y: pointY - ((anno.fontSize || 16) * 0.4),
                        size: anno.fontSize || 16,
                        font: fontRef,
                        color: rgb(txtColor.r, txtColor.g, txtColor.b)
                    });
                } else if (anno.type === 'whiteout') {
                    pdfPage.drawRectangle({
                        x: pointX - pointW / 2,
                        y: pointY - pointH / 2,
                        width: pointW,
                        height: pointH,
                        color: rgb(1, 1, 1)
                    });
                } else if (anno.type === 'rect') {
                    const isFilled = anno.fillColor && anno.fillColor !== 'transparent';
                    const fill = isFilled ? hexToRgb(anno.fillColor!) : null;

                    pdfPage.drawRectangle({
                        x: pointX - pointW / 2,
                        y: pointY - pointH / 2,
                        width: pointW,
                        height: pointH,
                        borderColor: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
                        borderWidth: anno.strokeWidth || 3,
                        color: isFilled ? rgb(fill!.r, fill!.g, fill!.b) : undefined
                    });
                } else if (anno.type === 'circle') {
                    const isFilled = anno.fillColor && anno.fillColor !== 'transparent';
                    const fill = isFilled ? hexToRgb(anno.fillColor!) : null;
                    const radius = pointW / 2;

                    pdfPage.drawCircle({
                        x: pointX,
                        y: pointY,
                        size: radius,
                        borderColor: rgb(strokeColor.r, strokeColor.g, strokeColor.b),
                        borderWidth: anno.strokeWidth || 3,
                        color: isFilled ? rgb(fill!.r, fill!.g, fill!.b) : undefined
                    });
                } else if (anno.type === 'image' && anno.imgSrc) {
                    const base64Data = anno.imgSrc.split(',')[1];
                    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

                    let embeddedImage;
                    if (anno.imgSrc.includes('image/png')) {
                        embeddedImage = await loadedPdfDoc.embedPng(imageBytes);
                    } else {
                        embeddedImage = await loadedPdfDoc.embedJpg(imageBytes);
                    }

                    pdfPage.drawImage(embeddedImage, {
                        x: pointX - pointW / 2,
                        y: pointY - pointH / 2,
                        width: pointW,
                        height: pointH
                    });
                }
            }

            const savedBytes = await loadedPdfDoc.save();
            const blob = new Blob([savedBytes as any], { type: 'application/pdf' });
            const downloadUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            const baseName = fileName.replace(/\.[^/.]+$/, "");
            link.download = `${baseName}_edited.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error rebuilding PDF:', error);
            alert('Error processing PDF compilation.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageExport = async (format: 'png' | 'jpeg') => {
        const canvas = document.querySelector('.pdf-canvas') as HTMLCanvasElement;
        if (!canvas) {
            alert('PDF Canvas page is not loaded.');
            return;
        }

        setLoading(true);
        try {
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = canvas.width;
            exportCanvas.height = canvas.height;

            const ctx = exportCanvas.getContext('2d');
            if (!ctx) throw new Error('Failed to get 2D canvas context');

            ctx.drawImage(canvas, 0, 0);

            const dpr = window.devicePixelRatio || 1;
            const widthPx = canvas.width / dpr;
            const heightPx = canvas.height / dpr;
            ctx.scale(dpr, dpr);

            const pageAnnotations = annotations.filter(a => a.page === usePdfStore.getState().currentPage);

            for (const anno of pageAnnotations) {
                const xPos = (anno.x / 100) * widthPx;
                const yPos = (anno.y / 100) * heightPx;
                const wPos = anno.width ? (anno.width / 100) * widthPx : 0;
                const hPos = anno.height ? (anno.height / 100) * heightPx : 0;

                if (anno.type === 'text' || anno.type === 'signature') {
                    ctx.font = `${anno.fontSize}px "${anno.fontFamily}"`;
                    ctx.fillStyle = anno.color || '#1a1714';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(anno.text || '', xPos, yPos);
                } else if (anno.type === 'text-edit') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(xPos, yPos, wPos, hPos);
                    ctx.fillStyle = anno.color || '#1a1714';
                    ctx.font = `${anno.fontSize}px sans-serif`;
                    ctx.textBaseline = 'top';
                    ctx.fillText(anno.text || '', xPos, yPos);
                } else if (anno.type === 'whiteout') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(xPos - wPos / 2, yPos - hPos / 2, wPos, hPos);
                } else if (anno.type === 'rect') {
                    ctx.strokeStyle = anno.color || '#1a1714';
                    ctx.lineWidth = anno.strokeWidth || 3;
                    ctx.fillStyle = anno.fillColor || 'transparent';
                    ctx.beginPath();
                    ctx.rect(xPos - wPos / 2, yPos - hPos / 2, wPos, hPos);
                    ctx.fill();
                    ctx.stroke();
                } else if (anno.type === 'circle') {
                    ctx.strokeStyle = anno.color || '#1a1714';
                    ctx.lineWidth = anno.strokeWidth || 3;
                    ctx.fillStyle = anno.fillColor || 'transparent';
                    ctx.beginPath();
                    ctx.arc(xPos, yPos, wPos / 2, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                } else if (anno.type === 'image' && anno.imgSrc) {
                    await new Promise<void>((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                            ctx.drawImage(img, xPos - wPos / 2, yPos - hPos / 2, wPos, hPos);
                            resolve();
                        };
                        img.src = anno.imgSrc!;
                    });
                }
            }

            const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
            const ext = format === 'jpeg' ? 'jpg' : 'png';
            const dataUrl = exportCanvas.toDataURL(mime, 0.95);

            const link = document.createElement('a');
            link.href = dataUrl;
            const baseName = fileName.replace(/\.[^/.]+$/, "");
            link.download = `${baseName}_page_${usePdfStore.getState().currentPage}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error(e);
            alert('Error exporting image format');
        } finally {
            setLoading(false);
        }
    };

    if (!pdfBytes) {
        return (
            <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
                <header className="h-16 bg-bg-secondary border-b border-border-primary flex items-center justify-between px-6 sticky top-0 z-50 transition-colors shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
                        <div className="bg-text-primary text-bg-secondary w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-base">
                            <Sparkles size={16} />
                        </div>
                        <span className="font-serif font-bold text-2xl tracking-tight">Edge-Pdf</span>
                    </div>
                    <div>
                        <button
                            onClick={() => router.push('/')}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border border-border-primary hover:bg-bg-tertiary transition-all cursor-pointer"
                        >
                            <ArrowLeft size={14} /> Back Home
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto text-center gap-6">
                    <div className="flex flex-col items-center gap-2 max-w-lg mb-4">
                        <h2 className="font-serif text-3xl font-bold">Open a PDF File to Start</h2>
                        <p className="text-sm text-text-secondary">
                            Load your document into the offline web sandbox to edit text layers, vector assets, and signatures.
                        </p>
                    </div>
                    <Dropzone />
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-bg-primary text-text-primary">
            <header className="h-16 bg-bg-secondary border-b border-border-primary flex items-center justify-between px-6 sticky top-0 z-50 transition-colors shadow-sm shrink-0">
                <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleExit}>
                    <div className="bg-text-primary text-bg-secondary w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-base">
                        <Sparkles size={16} />
                    </div>
                    <span className="font-serif font-bold text-2xl tracking-tight">Edge-Pdf</span>
                </div>

                <div className="text-xs max-w-xs md:max-w-md truncate bg-bg-tertiary border border-border-primary px-3 py-1.5 rounded-md font-semibold font-mono text-text-secondary select-all">
                    📄 {fileName}
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleExit}
                        className="btn btn-danger py-2 cursor-pointer"
                        disabled={loading}
                    >
                        Close Sandbox
                    </button>
                    <div className="flex gap-1">
                        <button
                            onClick={handlePDFDownload}
                            className="btn btn-indigo py-2 cursor-pointer shadow-sm disabled:opacity-50"
                            disabled={loading}
                        >
                            <Download size={14} /> PDF
                        </button>
                        <button
                            onClick={() => handleImageExport('png')}
                            className="btn py-2 cursor-pointer shadow-sm hidden md:inline-flex disabled:opacity-50"
                            disabled={loading}
                        >
                            <FileImage size={14} /> PNG
                        </button>
                        <button
                            onClick={() => handleImageExport('jpeg')}
                            className="btn py-2 cursor-pointer shadow-sm hidden md:inline-flex disabled:opacity-50"
                            disabled={loading}
                        >
                            <FileImage size={14} /> JPG
                        </button>
                    </div>
                </div>
            </header>

            <Toolbar />

            <div className="flex-1 flex overflow-hidden relative">
                <SidebarLeft />
                <CanvasPage />
                <SidebarRight />
            </div>

            <SignatureModal />
        </div>
    );
}
