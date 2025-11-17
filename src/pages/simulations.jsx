import { useState, useRef, useEffect } from "react";
import Chapter from "../components/Chapter.jsx";
import Chapters from "../data/chapters.js";

export default function Simulations() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [peekCard, setPeekCard] = useState(null);
  const peekRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const peekPos = useRef({ x: 0, y: 0 });

  const sliderRef = useRef(null);
  const containerRef = useRef(null);

  const nextCard = () =>
    setCurrentIndex((prev) => (prev + 1) % Chapters.length);
  const prevCard = () =>
    setCurrentIndex((prev) => (prev - 1 + Chapters.length) % Chapters.length);

  const prevIndex = (currentIndex - 1 + Chapters.length) % Chapters.length;
  const nextIndex = (currentIndex + 1) % Chapters.length;

  // Detect phones + tablets + touchscreen laptops
  const isTouch =
    typeof window !== "undefined" &&
    (window.innerWidth <= 1024 ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0);

  // Update pagination slider
  useEffect(() => {
    const container = containerRef.current;
    const slider = sliderRef.current;
    if (!container || !slider) return;

    const totalBars = Chapters.length;
    const style = getComputedStyle(container);
    const gap = parseFloat(style.gap) || 0;
    const barWidth = (container.offsetWidth - gap * (totalBars - 1)) / totalBars;

    slider.style.width = `${barWidth}px`;
    slider.style.transform = `translateX(${currentIndex * (barWidth + gap)}px)`;
  }, [currentIndex]);

  // Smooth peek card movement
  const animatePeek = () => {
    if (!peekCard || !peekRef.current) return;

    const lerp = (s, e, t) => s + (e - s) * t;

    peekPos.current.x = lerp(peekPos.current.x, mousePos.current.x, 0.15);
    peekPos.current.y = lerp(peekPos.current.y, mousePos.current.y, 0.15);

    const offsetY = -peekRef.current.offsetHeight / 2;

    const offsetX =
      peekCard.direction === "left"
        ? -peekRef.current.offsetWidth - 10
        : 10;

    peekRef.current.style.top = `${peekPos.current.y + offsetY}px`;
    peekRef.current.style.left = `${peekPos.current.x + offsetX}px`;

    requestAnimationFrame(animatePeek);
  };

  const handleMouseMove = (e) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    if (peekCard && !isTouch) requestAnimationFrame(animatePeek);
  }, [peekCard]);

  return (
    <main className="simulations-page">
      <div className="chapter-carousel-container">

        {/* LEFT BUTTON */}
        {currentIndex > 0 && (
          <button
            className="nav-button left"
            onClick={prevCard}
            {...(!isTouch && {
              onMouseEnter: () =>
                setPeekCard({ index: prevIndex, direction: "left" }),
              onMouseMove: handleMouseMove,
              onMouseLeave: () => setPeekCard(null),
            })}
          >
            &lt;
          </button>
        )}

        {/* RIGHT BUTTON */}
        {currentIndex < Chapters.length - 1 && (
          <button
            className="nav-button right"
            onClick={nextCard}
            {...(!isTouch && {
              onMouseEnter: () =>
                setPeekCard({ index: nextIndex, direction: "right" }),
              onMouseMove: handleMouseMove,
              onMouseLeave: () => setPeekCard(null),
            })}
          >
            &gt;
          </button>
        )}

        {/* CURRENT CARD */}
        <div className="chapter-carousel">
          <Chapter key={Chapters[currentIndex].id} {...Chapters[currentIndex]} />
        </div>

        {/* PEEK CARD — disabled for mobile/tablet */}
        {!isTouch && peekCard && (
          <Chapter
            key={`peek-${peekCard.index}`}
            {...Chapters[peekCard.index]}
            ref={peekRef}
            className="peek-hover"
          />
        )}

        {/* PAGINATION */}
        <div className="chapter-pagination" ref={containerRef}>
          {Chapters.map((_, index) => (
            <div
              key={index}
              className="pagination-bar"
              onClick={() => setCurrentIndex(index)}
            />
          ))}
          <div className="pagination-slider" ref={sliderRef} />
        </div>
      </div>
    </main>
  );
}
