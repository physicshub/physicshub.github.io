import { useEffect, useState } from "react";
import { Lightbulb, X } from "lucide-react";

export default function FunFactSlider({ fact }) {
  const [visible, setVisible] = useState(false);
  const [render, setRender] = useState(false);

  useEffect(() => {
    if (!fact) return;

    setRender(true);
    setTimeout(() => setVisible(true), 50);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    const removeTimer = setTimeout(() => {
      setRender(false);
    }, 5800);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [fact]);

  if (!render) return null;

  return (
    <div
      className={`
    relative w-full max-w-[320px] 
    rounded-xl border border-cyan-400/30
    bg-[#0b2529]/80 backdrop-blur-2xl
    p-4 shadow-[0_0_40px_rgba(34,211,238,0.1)]
    group overflow-hidden
    transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] mt-8  
    ${visible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-12 scale-95 "}
  `}
    >
      {/* Cyber-Grid Background Detail */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />

      {/* Top Glow/Reflection */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      {/* Corner Accent Decor */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/60 rounded-tl-xl" />

      <div className="flex items-start gap-4 relative z-10">
        {/* Icon Container with Layered Glow */}
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 rounded-lg bg-cyan-400/20 blur-sm animate-pulse" />
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[#0b3a3f] border border-cyan-400/40 shadow-inner">
            <Lightbulb
              size={18}
              className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pt-0.5 mt-9px">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
            <p className="text-cyan-400/70 text-[10px] tracking-[0.25em] uppercase font-black  font-extrabold">
              Do you know?
            </p>
          </div>
          <p className="text-cyan-50/90 text-[13px] leading-relaxed font-medium">
            <span className="text-cyan-400/50 mr-1 italic">“</span>
            {fact}
            <span className="text-cyan-400/50 ml-1 italic">”</span>
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setVisible(false)}
          className={`
    flex-shrink-0 -mt-1 -mr-1 p-2 
    rounded-lg border border-transparent
    hover:border-cyan-400/30 hover:bg-cyan-400/10 
    hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]
    transition-all duration-300 group/btn
  `}
        >
          <X
            size={15}
            className="
      text-cyan-400/50 
      group-hover/btn:text-cyan-200 
      group-hover/btn:rotate-90 
      group-hover/btn:scale-110
      transition-all duration-300
    "
          />
        </button>
      </div>
    </div>
  );
}
