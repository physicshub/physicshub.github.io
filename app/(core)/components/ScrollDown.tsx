
import { useEffect, useState } from 'react';

export default function ScrollDown() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const fadeStart = window.innerHeight * 0.9; // start fade after first viewport
      const fadeEnd = document.body.scrollHeight - window.innerHeight; // fully faded at the end
      if (window.scrollY < fadeStart) {
        setOpacity(1);
      } else if (window.scrollY > fadeEnd) {
        setOpacity(0);
      } else {
        // linear fade
        const newOpacity = 1 - (window.scrollY - fadeStart) / (fadeEnd - fadeStart);
        setOpacity(newOpacity);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      aria-label="Scroll down"
      onClick={() =>
        window.scrollBy({
          top: window.innerHeight,
          behavior: 'smooth',
        })
      }
      style={{ zIndex: 9999, opacity }}
      className="
        fixed left-1/2 bottom-6 -translate-x-1/2
        w-14 h-14 rounded-full
        bg-cyan-400 text-white border-2 border-cyan-400
        shadow-xl shadow-emerald-300/40
        cursor-pointer flex items-center justify-center
        animate-bounce
        hover:scale-115
        transition-opacity duration-500
        focus:outline-none
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 640 640"
        fill="currentColor"
      >
        <path d="M297.4 558.6C309.9 571.1 330.2 571.1 342.7 558.6L502.7 398.6C515.2 386.1 515.2 365.8 502.7 353.3C490.2 340.8 469.9 340.8 457.4 353.3L352 458.7L352 88C352 70.3 337.7 56 320 56C302.3 56 288 70.3 288 88L288 458.7L182.6 353.3C170.1 340.8 149.8 340.8 137.3 353.3C124.8 365.8 124.8 386.1 137.3 398.6L297.3 558.6z" />
      </svg>
    </button>
  );
}
