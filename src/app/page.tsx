'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, Lock, Layers, Globe } from 'lucide-react';

const Dropzone = dynamic(() => import('../components/Dropzone'), { ssr: false });

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      // Map scroll progress between 0 and 420px to a 0.0 - 1.0 ratio
      const ratio = Math.min(1, scrolled / 420);
      setScrollProgress(ratio);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="dark-obsidian-page min-h-screen relative overflow-hidden font-sans select-none pb-24">

      {/* Decorative Blueprint Grid Backdrop */}
      <div className="absolute inset-0 draft-grid opacity-35 pointer-events-none z-0" />

      {/* Radiant Glow Highlight */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-brand-indigo/5 blur-[120px] pointer-events-none z-0" />

      {/* Premium Apple-Style Blur Navigation Bar */}
      <header className="h-14 border-b border-border-primary/45 bg-bg-primary/80 backdrop-blur-md flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 transition-all select-none">
        <div className="flex items-center gap-3">
          <div className="bg-text-primary text-bg-primary w-6 h-6 border border-border-primary flex items-center justify-center font-mono font-bold text-[10px] tracking-tighter">
            EP
          </div>
          <span className="font-mono text-xs font-bold tracking-widest uppercase">Edge-Pdf</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono text-text-secondary select-none">
          <a href="#objectives" className="hover:text-text-primary transition-colors">/ OBJECTIVES</a>
          <a href="#specs" className="hover:text-text-primary transition-colors">/ SPECIFICATIONS</a>
          <span className="text-brand-indigo antialiased text-[9px] border border-brand-indigo/40 px-1.5 py-0.5 font-bold uppercase tracking-wider">
            Sandboxed Node
          </span>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/editor"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-bold border border-border-primary bg-text-primary text-bg-primary hover:bg-transparent hover:text-text-primary transition-all duration-300"
          >
            Launch Editor <ArrowRight size={12} />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex flex-col items-center max-w-5xl mx-auto w-full px-6">

        {/* Hero Section */}
        <section
          className="flex flex-col items-center text-center gap-6 max-w-2xl mt-16 md:mt-24 pointer-events-none"
          style={{
            opacity: 1 - scrollProgress * 1.6,
            transform: `translateY(${-scrollProgress * 65}px)`,
            transition: 'opacity 0.08s ease-out, transform 0.08s ease-out'
          }}
        >
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-brand-indigo/35 font-mono text-[9px] uppercase font-bold select-none text-brand-indigo tracking-widest bg-brand-indigo-light">
            [ Local-First Document Console ]
          </div>

          <h1 className="font-sans font-black text-5xl md:text-7xl tracking-tighter leading-[1.02] text-text-primary select-text uppercase">
            A sandbox for <br />
            <span className="text-brand-indigo">your files.</span>
          </h1>

          <p className="font-mono text-[11px] text-text-secondary max-w-lg leading-relaxed mt-2 uppercase tracking-wider select-text text-center mx-auto">
            Zero network retention. Overwrite text, insert shapes, and sign documents locally in browser RAM.
          </p>
        </section>

        {/* Interactive Scroll-Scaled Workspace Card */}
        <section
          className="w-full flex justify-center mt-12 md:mt-16 sticky top-20 z-20 pb-16"
          style={{
            transform: `scale(${1 - scrollProgress * 0.22}) translateY(${scrollProgress * -25}px)`,
            transition: 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div
            className="w-full max-w-2xl border border-border-primary bg-bg-secondary p-1 shadow-2xl relative transition-all duration-500"
            style={{
              boxShadow: `0 25px 75px -12px rgba(0, 0, 0, ${0.45 + scrollProgress * 0.25})`
            }}
          >
            {/* Viewport Header Controls Indicators */}
            <div className="h-6 border-b border-border-primary/20 flex items-center justify-between px-3 select-none bg-bg-primary/50">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-border-primary/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-border-primary/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-border-primary/30" />
              </div>
              <span className="font-mono text-[8px] text-text-secondary uppercase tracking-widest">
                Workspace / sandbox_layer_ref
              </span>
              <div className="w-4" />
            </div>

            <div className="p-4 bg-bg-primary/30">
              <Dropzone />
            </div>
          </div>
        </section>

        {/* Scroll Divider to provide breathing space */}
        <div className="h-24" />

        {/* Objectives Section */}
        <section id="objectives" className="w-full max-w-3xl flex flex-col gap-12 mt-12 z-30 relative select-text">
          <div className="flex flex-col gap-2 border-b border-border-primary/20 pb-4 text-center items-center">
            <span className="font-mono text-[9px] text-brand-indigo tracking-widest uppercase font-bold">
              [ SECTION 02 // VALUES & MECHANICS ]
            </span>
            <h2 className="font-serif text-3xl font-normal text-text-primary">
              Minimal footprint. Immutable control.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full border border-border-primary flex items-center justify-center text-brand-indigo bg-brand-indigo-light shadow-sm">
                <Lock size={14} />
              </div>
              <h3 className="font-serif text-lg font-normal text-text-primary leading-tight">
                Zero Retention Sandboxing
              </h3>
              <p className="font-mono text-[11.5px] text-text-secondary leading-relaxed normal-case select-text">
                Every document byte is allocated strictly inside sandboxed browser memory. Your files are never cached, compiled, or transmitted to remote server resources.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full border border-border-primary flex items-center justify-center text-brand-indigo bg-brand-indigo-light shadow-sm">
                <Layers size={14} />
              </div>
              <h3 className="font-serif text-lg font-normal text-text-primary leading-tight">
                Direct Vector Precision
              </h3>
              <p className="font-mono text-[11.5px] text-text-secondary leading-relaxed normal-case select-text">
                Directly intersect native PDF font tables to edit typographical data in-place, apply custom redaction vector masks, and layer cursive stamp signatures.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full border border-border-primary flex items-center justify-center text-brand-indigo bg-brand-indigo-light shadow-sm">
                <Globe size={14} />
              </div>
              <h3 className="font-serif text-lg font-normal text-text-primary leading-tight">
                Immutable Offline Loop
              </h3>
              <p className="font-mono text-[11.5px] text-text-secondary leading-relaxed normal-case select-text">
                No premium tier limits, paywalls, or watermark injections. Operate fully offline in isolated sandboxes. Lightweight script footprints ready for local compiling.
              </p>
            </div>
          </div>
        </section>

        {/* Specifications Matrix Section */}
        <section id="specs" className="w-full max-w-3xl mt-24 mb-12 relative z-30">
          <div className="border border-border-primary/45 bg-bg-secondary/40 p-6 md:p-8 flex flex-col gap-6 backdrop-blur-sm relative">
            <span className="absolute top-3 right-4 font-mono text-[7px] text-text-secondary tracking-widest select-none">
              [ METRIC MATRIX REF: EP-001 ]
            </span>

            <div className="flex flex-col gap-1 border-b border-border-primary/20 pb-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-text-primary">
                Technical Blueprint Audit
              </h3>
              <p className="font-mono text-[9px] text-text-secondary uppercase tracking-widest mt-0.5">
                Edge-PDF sandboxing compared against remote cloud endpoints
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-2">

              {/* Column A */}
              <div className="flex flex-col gap-4 border border-border-primary/20 p-4 bg-bg-primary/25 font-mono text-[10px] text-text-secondary">
                <span className="text-[9px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-border-primary/25 pb-2 font-mono">
                  <span className="w-1.5 h-1.5 bg-red-400/70 rounded-full" />
                  Remote Cloud Platforms
                </span>
                <ul className="flex flex-col gap-2.5">
                  <li className="flex items-start gap-2 select-text">
                    <span className="text-red-400 font-bold shrink-0">[-]</span>
                    <span>Transfers absolute document files over external API connection pipelines.</span>
                  </li>
                  <li className="flex items-start gap-2 select-text">
                    <span className="text-red-400 font-bold shrink-0">[-]</span>
                    <span>Collects user tracking identifiers, telemetry cookies, and analytics.</span>
                  </li>
                  <li className="flex items-start gap-2 select-text">
                    <span className="text-red-400 font-bold shrink-0">[-]</span>
                    <span>Forces subscription login models for premium export options.</span>
                  </li>
                </ul>
              </div>

              {/* Column B */}
              <div className="flex flex-col gap-4 border border-brand-indigo/50 p-4 bg-bg-primary/80 font-mono text-[10px] text-text-secondary shadow-[3px_3px_0px_var(--color-brand-indigo)]">
                <span className="text-[9px] font-bold text-brand-indigo uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-indigo/25 pb-2 font-mono">
                  <span className="w-1.5 h-1.5 bg-brand-indigo rounded-full animate-pulse" />
                  Edge-PDF Client Engine
                </span>
                <ul className="flex flex-col gap-2.5 text-text-primary">
                  <li className="flex items-start gap-2 select-text">
                    <span className="text-brand-indigo font-bold shrink-0">[+]</span>
                    <span><strong>100% Client-Side</strong>: compilation calculations execute strictly in user local RAM.</span>
                  </li>
                  <li className="flex items-start gap-2 select-text">
                    <span className="text-brand-indigo font-bold shrink-0">[+]</span>
                    <span>Zero third-party trackers, server logging, or meta analytics capture.</span>
                  </li>
                  <li className="flex items-start gap-2 select-text">
                    <span className="text-brand-indigo font-bold shrink-0">[+]</span>
                    <span>Completely **free and open-source**. Unlimited exports with zero watermarks.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full text-center border-t border-border-primary/20 pt-8 mt-12 bg-bg-secondary/20 relative z-30 select-none">
        <p className="font-mono text-[8px] uppercase tracking-widest text-text-secondary">
          Edge-PDF // Local Memory Blueprint Security Sandbox
        </p>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#e2c079] mt-1.5">
          WebAssembly Sandboxed Core · Made with Love, ANKIT
        </p>
      </footer>

    </div>
  );
}
