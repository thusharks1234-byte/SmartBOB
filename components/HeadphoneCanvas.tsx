"use client";

import { useEffect, useRef, useCallback } from "react";
import { useScroll, useSpring, useTransform, motion } from "framer-motion";

const TOTAL_FRAMES = 300;

const beats = [
  {
    id: "beat-a",
    start: 0.0,
    end: 0.2,
    align: "center" as const,
    eyebrow: "AI-POWERED SMART ANALYSIS",
    title: "Smart Bob",
    subtitle: "Intelligent real-time security analysis for your smart contracts.",
    bigTitle: true,
    cta: false,
  },
  {
    id: "beat-b",
    start: 0.25,
    end: 0.45,
    align: "left" as const,
    eyebrow: "VULNERABILITY DETECTION",
    title: "Access Control Failures",
    subtitle: "Stops Unauthorized Access.",
    bigTitle: false,
    cta: false,
  },
  {
    id: "beat-c",
    start: 0.5,
    end: 0.7,
    align: "right" as const,
    eyebrow: "EXPLOIT PREVENTION",
    title: "Reentrancy",
    subtitle: "Detects Repeated Withdrawals.",
    bigTitle: false,
    cta: false,
  },
  {
    id: "beat-d",
    start: 0.75,
    end: 0.97,
    align: "center" as const,
    eyebrow: "CONTINUOUS SECURITY",
    title: "Repair Retesting",
    subtitle: "Fix It. Test It. Trust It.",
    bigTitle: false,
    cta: false,
  },
];

type Beat = typeof beats[0];

function BeatOverlay({
  beat,
  smoothProgress,
}: {
  beat: Beat;
  smoothProgress: ReturnType<typeof useSpring>;
}) {
  const { start, end, align, eyebrow, title, subtitle, bigTitle } = beat;
  const range = end - start;

  const opacity = useTransform(
    smoothProgress,
    [start, start + range * 0.12, end - range * 0.12, end],
    [0, 1, 1, 0]
  );

  const y = useTransform(
    smoothProgress,
    [start, start + range * 0.12, end - range * 0.12, end],
    [24, 0, 0, -24]
  );

  const alignClass =
    align === "left"
      ? "items-start text-left pl-10 md:pl-20 lg:pl-32"
      : align === "right"
      ? "items-end text-right pr-10 md:pr-20 lg:pr-32"
      : "items-center text-center";

  return (
    <motion.div
      style={{ opacity, y }}
      className={`absolute inset-0 flex flex-col justify-center pointer-events-none px-6 ${alignClass}`}
    >
      <div className="max-w-lg w-full">
        <p className="text-xs md:text-sm font-semibold tracking-[0.3em] text-white/40 uppercase mb-4 font-mono">
          {eyebrow}
        </p>
        <h2 className={bigTitle
          ? "text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-white/90 leading-none mb-4"
          : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white/90 leading-tight mb-4"
        }>
          {title}
        </h2>
        <p className="text-sm md:text-base text-white/55 leading-relaxed max-w-xs font-light tracking-wide">
          {subtitle}
        </p>

      </div>
    </motion.div>
  );
}

function ScrollIndicator({
  smoothProgress,
}: {
  smoothProgress: ReturnType<typeof useSpring>;
}) {
  const opacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
    >
      <span className="text-xs tracking-[0.3em] text-white/40 uppercase font-mono">
        Scroll to Explore
      </span>
      <motion.div
        className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent"
        animate={{ scaleY: [1, 0.4, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

export default function HeadphoneCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedCountRef = useRef(0);
  const isReadyRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(-1);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastDprRef = useRef(0);
  const lastWRef = useRef(0);
  const lastHRef = useRef(0);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;

    if (
      canvas.width !== Math.round(cw * dpr) ||
      canvas.height !== Math.round(ch * dpr) ||
      lastDprRef.current !== dpr
    ) {
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      lastDprRef.current = dpr;
      lastWRef.current = cw;
      lastHRef.current = ch;
      ctxRef.current = canvas.getContext("2d");
      if (ctxRef.current) {
        ctxRef.current.scale(dpr, dpr);
      }
    }

    const ctx = ctxRef.current;
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const wRatio = cw / iw;
    const hRatio = ch / ih;
    // Cover fit: fill entire canvas, cropping excess edges
    const scale = Math.max(wRatio, hRatio);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    // Fill background first so zero gaps show page color
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  // Decoupled RAF render loop — zero React state mutations on scroll
  useEffect(() => {
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      if (!isReadyRef.current) return;

      const progress = smoothProgress.get();
      const clamped = Math.max(0, Math.min(1, progress));
      const frameIndex = Math.min(
        Math.floor(clamped * TOTAL_FRAMES),
        TOTAL_FRAMES - 1
      );

      const canvas = canvasRef.current;
      const cw = canvas?.clientWidth ?? 0;
      const ch = canvas?.clientHeight ?? 0;
      const sizeChanged = cw !== lastWRef.current || ch !== lastHRef.current;

      if (frameIndex !== lastFrameRef.current || sizeChanged) {
        lastFrameRef.current = frameIndex;
        drawFrame(frameIndex);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [smoothProgress, drawFrame]);

  // Preload all frames with decode() for GPU readiness
  useEffect(() => {
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    imagesRef.current = images;
    loadedCountRef.current = 0;
    isReadyRef.current = false;

    const progressBar = document.getElementById("aetheria-progress-bar") as HTMLElement | null;
    const progressText = document.getElementById("aetheria-progress-text") as HTMLElement | null;
    const loadingOverlay = document.getElementById("aetheria-loading") as HTMLElement | null;

    const onLoaded = () => {
      loadedCountRef.current++;
      const pct = (loadedCountRef.current / TOTAL_FRAMES) * 100;

      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressText) progressText.textContent = `${Math.round(pct)}%`;

      if (loadedCountRef.current === TOTAL_FRAMES) {
        isReadyRef.current = true;
        drawFrame(0);
        if (loadingOverlay) {
          loadingOverlay.style.transition = "opacity 0.9s ease";
          loadingOverlay.style.opacity = "0";
          setTimeout(() => {
            if (loadingOverlay) loadingOverlay.style.display = "none";
          }, 950);
        }
      }
    };

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/sequence/frame_${i}.jpg`;
      img.decode().then(onLoaded).catch(onLoaded);
      images[i] = img;
    }

    return () => {
      images.forEach((img) => { img.src = ""; });
    };
  }, [drawFrame]);

  return (
    <>
      {/* DOM-direct loading overlay for zero-jank performance */}
      <div
        id="aetheria-loading"
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]"
      >
        <div className="flex flex-col items-center gap-8">
          <div className="text-center">
            <p className="text-xs tracking-[0.5em] text-white/30 uppercase font-mono mb-2">
              Loading Experience
            </p>
            <h1 className="text-3xl font-black tracking-tighter text-white/80">
              AETHERIA ONE
            </h1>
          </div>
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-0 rounded-full border-t border-white/70 animate-spin" />
          </div>
          <div className="w-48 md:w-64">
            <div className="flex justify-between text-xs text-white/30 font-mono mb-2">
              <span>Preloading frames</span>
              <span id="aetheria-progress-text">0%</span>
            </div>
            <div className="h-px bg-white/10 rounded-full overflow-hidden">
              <div
                id="aetheria-progress-bar"
                className="h-full bg-white/60 rounded-full"
                style={{ width: "0%", transition: "width 0.1s linear" }}
              />
            </div>
          </div>
        </div>
      </div>

      <ScrollIndicator smoothProgress={smoothProgress} />

      {/* Scroll container: 500vh for generous scroll duration */}
      <div ref={containerRef} style={{ height: "500vh" }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Canvas fills sticky viewport */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ display: "block" }}
          />
          {/* Text beat overlays */}
          <div className="absolute inset-0">
            {beats.map((beat) => (
              <BeatOverlay
                key={beat.id}
                beat={beat}
                smoothProgress={smoothProgress}
              />
            ))}
          </div>
          {/* Edge vignette for seamless bg blend */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 40%, rgba(5,5,5,0.65) 100%)",
            }}
          />
        </div>
      </div>
    </>
  );
}
