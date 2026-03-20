"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Status:</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          Agent Online
        </span>
      </div>
      <Image className="opacity-40 grayscale" src="/next.svg" alt="" width={60} height={12} />
    </header>
  );
}
