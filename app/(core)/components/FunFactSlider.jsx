import { useEffect, useState, useCallback } from "react";
import { Lightbulb, X } from "lucide-react";

const DISPLAY_DURATION = 4500;

export default function FunFactSlider({ fact }) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(100);

  const dismiss = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!fact) return;

    setOpen(true);
    setProgress(100);

    const start = Date.now();


    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(
        0,
        100 - (elapsed / DISPLAY_DURATION) * 100
      );
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);

    const timer = setTimeout(() => setOpen(false), DISPLAY_DURATION);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fact]);

  if (!fact) return null;

  return (
    <div
  className={`
    absolute top-1/2 right-0 -translate-y-1/2 z-50
    w-[340px] max-w-[90vw]
    transition-all duration-500 ease-out
    ${
      open
        ? "translate-x-0 opacity-100"
        : "translate-x-full opacity-0"
    }
  `}
  role="status"
  aria-live="polite"
>
  <div
    className="
      relative overflow-hidden rounded-2xl
      border border-white/20
      bg-gradient-to-br from-card/80 to-card/60
      backdrop-blur-xl
      shadow-[0_12px_32px_rgba(0,0,0,0.25)]
    "
  >
    {/* Close button */}
    <button
      onClick={dismiss}
      aria-label="Dismiss fun fact"
      className="
        absolute top-2 right-2
        p-1.5 rounded-full
        text-muted-foreground/70
        hover:text-foreground
        hover:bg-white/10
        transition
      "
    >
      <X size={14} />
    </button>

    <div className="flex items-start gap-3 px-4 py-3">
      {/* Glowing bulb */}
      <div className="mt-1 flex-shrink-0">
        <div
          className="
            w-9 h-9 rounded-full
            bg-primary/15
            flex items-center justify-center
            shadow-[0_0_14px_hsl(var(--primary)/0.45)]
          "
        >
          <Lightbulb
            size={18}
            className="text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
          />
        </div>
      </div>

      {/* Text */}
      <div className="min-w-0">
        <p
          className="
            text-[11px]
            font-semibold
            tracking-[0.18em]
            uppercase
            text-primary
          "
        >
          Fun Fact
        </p>

        <p
          className="
            mt-1
            text-sm
            leading-relaxed
            text-foreground/80
          "
        >
          {fact}
        </p>
      </div>
    </div>
  </div>
</div>


  );
}
