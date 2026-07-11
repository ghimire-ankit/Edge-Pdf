import { create } from 'zustand';

export type ToolMode =
    | 'select'
    | 'text'
    | 'signature'
    | 'whiteout'
    | 'rect'
    | 'circle'
    | 'image'
    | 'edit-text'
    | 'text-edit';

export interface Annotation {
    id: string;
    page: number;
    x: number; // percentage (0-100)
    y: number; // percentage (0-100)
    type: ToolMode;
    color?: string;
    width?: number; // percentage width
    height?: number; // percentage height
    text?: string;
    fontFamily?: string;
    fontName?: string;
    fontSize?: number;
    isEditing?: boolean;
    imgSrc?: string; // base64 representation
    fillColor?: string;
    strokeWidth?: number;
    originalText?: string;
    pdfFont?: string;
}

export interface ExtractedTextItem {
    id: string;
    str: string;
    x: number; // percentage
    y: number; // percentage
    w: number; // percentage
    h: number; // percentage
    fontSize: number;
    fontName: string;
    fontFamily?: string;
    pdfFont?: string;
}

interface PdfState {
    // Routing view state
    view: 'landing' | 'editor';
    fileName: string;
    pdfBytes: Uint8Array | null;
    // We store the pdfjs document reference typed as any to avoid tight coupling
    pdfDoc: any | null;

    // Navigation and scaling
    numPages: number;
    currentPage: number;
    scale: number;
    loading: boolean;
    renderingPage: boolean;

    // Editor modes & selections
    toolMode: ToolMode;
    annotations: Annotation[];
    selectedAnnoId: string | null;
    extractedTextItems: ExtractedTextItem[];

    // Signature modal states
    isSignModalOpen: boolean;
    signatureText: string;
    signatureFont: string;
    signatureImageURL: string | null;
    signatureType: 'type' | 'draw';

    // History undo/redo state stack
    past: Annotation[][];
    future: Annotation[][];

    // Setters & Actions
    setView: (view: 'landing' | 'editor') => void;
    setFileName: (name: string) => void;
    setPdfBytes: (bytes: Uint8Array | null) => void;
    setPdfDoc: (doc: any | null) => void;
    setNumPages: (num: number) => void;
    setCurrentPage: (page: number | ((prev: number) => number)) => void;
    setScale: (scale: number | ((prev: number) => number)) => void;
    setLoading: (loading: boolean) => void;
    setRenderingPage: (rendering: boolean) => void;
    setToolMode: (mode: ToolMode) => void;
    setAnnotations: (annotations: Annotation[] | ((prev: Annotation[]) => Annotation[])) => void;
    addAnnotation: (anno: Annotation) => void;
    updateAnnotation: (id: string, fields: Partial<Annotation>) => void;
    deleteAnnotation: (id: string) => void;
    setSelectedAnnoId: (id: string | null) => void;
    setExtractedTextItems: (items: ExtractedTextItem[]) => void;
    setIsSignModalOpen: (isOpen: boolean) => void;
    setSignatureText: (text: string) => void;
    setSignatureFont: (font: string) => void;
    setSignatureImageURL: (url: string | null) => void;
    setSignatureType: (type: 'type' | 'draw') => void;
    undo: () => void;
    redo: () => void;
    reset: () => void;
}

export const usePdfStore = create<PdfState>((set) => ({
    view: 'landing',
    fileName: '',
    pdfBytes: null,
    pdfDoc: null,
    numPages: 0,
    currentPage: 1,
    scale: 1.2,
    loading: false,
    renderingPage: false,
    toolMode: 'select',
    annotations: [],
    selectedAnnoId: null,
    extractedTextItems: [],
    isSignModalOpen: false,
    signatureText: '',
    signatureFont: 'Caveat',
    signatureImageURL: null,
    signatureType: 'type',
    past: [],
    future: [],

    setView: (view) => set({ view }),
    setFileName: (fileName) => set({ fileName }),
    setPdfBytes: (pdfBytes) => set({ pdfBytes }),
    setPdfDoc: (pdfDoc) => set({ pdfDoc }),
    setNumPages: (numPages) => set({ numPages }),

    setCurrentPage: (page) => set((state) => ({
        currentPage: typeof page === 'function' ? page(state.currentPage) : page
    })),

    setScale: (scale) => set((state) => ({
        scale: typeof scale === 'function' ? scale(state.scale) : scale
    })),

    setLoading: (loading) => set({ loading }),
    setRenderingPage: (renderingPage) => set({ renderingPage }),
    setToolMode: (toolMode) => set({ toolMode }),

    setAnnotations: (annotations) => set((state) => {
        const nextAnnos = typeof annotations === 'function' ? annotations(state.annotations) : annotations;
        return {
            past: [...state.past, state.annotations],
            future: [],
            annotations: nextAnnos
        };
    }),

    addAnnotation: (anno) => set((state) => ({
        past: [...state.past, state.annotations],
        future: [],
        annotations: [...state.annotations, anno]
    })),

    updateAnnotation: (id, fields) => set((state) => {
        const hasSubstantialChange = fields.x !== undefined || fields.y !== undefined || fields.text !== undefined || fields.width !== undefined || fields.height !== undefined || fields.color !== undefined || fields.fillColor !== undefined;
        const nextPast = hasSubstantialChange ? [...state.past, state.annotations] : state.past;
        return {
            past: nextPast,
            future: hasSubstantialChange ? [] : state.future,
            annotations: state.annotations.map((anno) =>
                anno.id === id ? { ...anno, ...fields } : anno
            )
        };
    }),

    deleteAnnotation: (id) => set((state) => ({
        past: [...state.past, state.annotations],
        future: [],
        annotations: state.annotations.filter((anno) => anno.id !== id),
        selectedAnnoId: state.selectedAnnoId === id ? null : state.selectedAnnoId
    })),

    setSelectedAnnoId: (selectedAnnoId) => set({ selectedAnnoId }),
    setExtractedTextItems: (extractedTextItems) => set({ extractedTextItems }),
    setIsSignModalOpen: (isSignModalOpen) => set({ isSignModalOpen }),
    setSignatureText: (signatureText) => set({ signatureText }),
    setSignatureFont: (signatureFont) => set({ signatureFont }),
    setSignatureImageURL: (signatureImageURL) => set({ signatureImageURL }),
    setSignatureType: (signatureType) => set({ signatureType }),

    undo: () => set((state) => {
        if (state.past.length === 0) return {};
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, state.past.length - 1);
        return {
            past: newPast,
            future: [state.annotations, ...state.future],
            annotations: previous,
            selectedAnnoId: null
        };
    }),

    redo: () => set((state) => {
        if (state.future.length === 0) return {};
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        return {
            past: [...state.past, state.annotations],
            future: newFuture,
            annotations: next,
            selectedAnnoId: null
        };
    }),

    reset: () => set({
        fileName: '',
        pdfBytes: null,
        pdfDoc: null,
        numPages: 0,
        currentPage: 1,
        annotations: [],
        extractedTextItems: [],
        selectedAnnoId: null,
        toolMode: 'select',
        view: 'landing',
        past: [],
        future: [],
        signatureImageURL: null,
        signatureType: 'type'
    })
}));
