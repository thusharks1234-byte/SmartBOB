import type { Metadata } from "next";
import HeadphoneCanvas from "@/components/HeadphoneCanvas";

export const metadata: Metadata = {
  title: "Aetheria One — Next-Gen Quantum Audio Headphones",
  description:
    "Experience sound in zero gravity. The Aetheria One features custom-engineered planar magnetic drivers, aerospace carbon construction, and active noise cancellation redefined.",
};

export default function Home() {
  return (
    <main className="bg-[#050505] min-h-screen">
      <HeadphoneCanvas />

      <footer className="bg-[#050505] border-t border-white/5 py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-black tracking-tighter text-white/90 mb-3">
              AETHERIA ONE
            </h3>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              The next frontier in personal audio. Engineered for those who demand the absolute.
            </p>
          </div>
          <div>
            <p className="text-xs tracking-[0.25em] text-white/30 uppercase font-mono mb-4">Product</p>
            <ul className="space-y-2 text-sm text-white/50">
              <li className="hover:text-white/80 cursor-pointer transition-colors">Overview</li>
              <li className="hover:text-white/80 cursor-pointer transition-colors">Specifications</li>
              <li className="hover:text-white/80 cursor-pointer transition-colors">Technology</li>
              <li className="hover:text-white/80 cursor-pointer transition-colors">Pre-Order</li>
            </ul>
          </div>
          <div>
            <p className="text-xs tracking-[0.25em] text-white/30 uppercase font-mono mb-4">Company</p>
            <ul className="space-y-2 text-sm text-white/50">
              <li className="hover:text-white/80 cursor-pointer transition-colors">About</li>
              <li className="hover:text-white/80 cursor-pointer transition-colors">Press</li>
              <li className="hover:text-white/80 cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-white/80 cursor-pointer transition-colors">Contact</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/20 font-mono">
            © 2026 Aetheria Audio Inc. All rights reserved.
          </p>
          <p className="text-xs text-white/20 font-mono">
            Crafted with precision · Version 1.0.0
          </p>
        </div>
      </footer>
    </main>
  );
}
