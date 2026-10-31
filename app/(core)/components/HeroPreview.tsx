"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { HERO_SCENES, type SceneInstance } from "./heroScenes";
import useTranslation from "../hooks/useTranslation.ts";

// The landing hero's live preview: one canvas cycling through the scenes in
// heroScenes.ts. The active tab's progress bar is a CSS animation, and its
// `animationend` advances the rotation, so pausing the animation (hover,
// focus, off-screen, the pause button) pauses the rotation with it. Under
// reduced motion nothing rotates or animates: each scene is a still frame and
// the tabs switch between them.

const ROTATE_MS = 9000;
const FADE_MS = 220;
const DT = 1 / 240;

type Engine = {
  show(index: number): void;
  redraw(): void;
  restart(): void;
  setRunning(running: boolean): void;
};

export default function HeroPreview() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0); // selected tab
  const [shown, setShown] = useState(0); // scene on the canvas (lags by the fade)
  const [reduceMotion, setReduceMotion] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const valueRefs = useRef<(HTMLElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setReduceMotion(reduce);

    // Each visit opens on a random scene. It is picked here, after mount, not
    // during render: the server always renders the first scene, and choosing
    // on the client before hydration would mismatch. The canvas only ever
    // draws on the client, so the first scene never flashes; the tabs and
    // caption swap in place (fixed heights, no layout shift).
    let index = Math.floor(Math.random() * HERO_SCENES.length);
    let scene: SceneInstance = HERO_SCENES[index].create(false);
    setActive(index);
    setShown(index);
    let width = 0;
    let height = 0;
    const colors = { fg: "#e8eefb", accent: "#00e6e6" };

    const readColors = () => {
      const cs = getComputedStyle(canvas);
      colors.accent =
        cs.getPropertyValue("--accent-color").trim() || colors.accent;
      colors.fg = cs.getPropertyValue("--ph-fg").trim() || colors.fg;
    };

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      scene.draw(ctx, width, height, colors);
      ctx.globalAlpha = 1;
      scene.values().forEach((v, i) => {
        const el = valueRefs.current[i];
        if (el) el.textContent = v;
      });
    };

    // Reduced motion: advance off-screen and show one representative frame.
    const prewarm = () => {
      const steps = Math.round(HERO_SCENES[index].prewarm / DT);
      for (let i = 0; i < steps; i++) scene.step(DT);
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      draw();
    };

    let raf = 0;
    let last = 0;
    let acc = 0;
    let running = !reduce;
    let visible = true;

    const frame = (now: number) => {
      raf = 0;
      if (!running || !visible || document.hidden) return;
      acc += Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      while (acc >= DT) {
        scene.step(DT);
        acc -= DT;
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf || !running || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    let fadeTimer = 0;
    const swap = (next: number, perturb: boolean) => {
      index = next;
      scene = HERO_SCENES[next].create(perturb);
      if (reduce) prewarm();
      setShown(next);
      draw();
    };

    // `active` is still the server's 0 on the first commit, while the engine
    // has already opened on its random scene: ignore every request until the
    // tabs have caught up with it. Kept here rather than in a ref on the
    // component so a remount (StrictMode, fast refresh) starts over too.
    let synced = false;
    engineRef.current = {
      show(next) {
        if (!synced) {
          synced = next === index;
          return;
        }
        // Always cancel a pending fade: otherwise a request for the scene
        // already shown would let an earlier fade land on the wrong one.
        window.clearTimeout(fadeTimer);
        canvas.classList.remove("is-fading");
        if (next === index) return;
        if (reduce) {
          swap(next, false);
          return;
        }
        canvas.classList.add("is-fading");
        fadeTimer = window.setTimeout(() => {
          swap(next, false);
          canvas.classList.remove("is-fading");
        }, FADE_MS);
      },
      redraw: draw,
      // A click restarts the current scene from a slightly different start.
      restart() {
        swap(index, true);
      },
      setRunning(next) {
        running = next && !reduce;
        if (running) start();
      },
    };

    readColors();
    if (reduce) prewarm();
    const themeObserver = new MutationObserver(() => {
      readColors();
      draw();
    });
    for (const el of [document.documentElement, document.body]) {
      themeObserver.observe(el, {
        attributes: true,
        attributeFilter: ["data-theme", "class"],
      });
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // Only run while the hero is on screen and the tab is visible.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      setOnScreen(visible);
      start();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", start);
    start();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fadeTimer);
      io.disconnect();
      themeObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", start);
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.show(active);
  }, [active]);

  // The readout rows are re-created when the scene changes; fill them now
  // rather than on the next frame, which never comes while paused.
  useEffect(() => {
    engineRef.current?.redraw();
  }, [shown]);

  useEffect(() => {
    engineRef.current?.setRunning(!userPaused);
  }, [userPaused]);

  const advance = useCallback(
    () => setActive((i) => (i + 1) % HERO_SCENES.length),
    []
  );

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (active + delta + HERO_SCENES.length) % HERO_SCENES.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const rotationPaused = userPaused || hovered || focused || !onScreen;
  const current = HERO_SCENES[shown];

  return (
    <figure
      className="ph-preview"
      data-paused={rotationPaused ? "" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setFocused(false);
      }}
    >
      <div
        className="ph-preview__plate"
        id="ph-preview-panel"
        role="tabpanel"
        aria-label={t(current.label)}
      >
        <canvas
          ref={canvasRef}
          className="ph-preview__canvas"
          aria-hidden="true"
          onClick={() => engineRef.current?.restart()}
        />
        <dl className="ph-preview__readout" aria-hidden="true">
          {current.readout.map((symbol, i) => (
            <div key={`${current.id}-${symbol}`}>
              <dt>{symbol}</dt>
              <dd
                ref={(el) => {
                  valueRefs.current[i] = el;
                }}
              />
            </div>
          ))}
        </dl>
      </div>

      <div className="ph-preview__controls">
        <div
          className="ph-preview__tabs"
          role="tablist"
          aria-label={t("Live previews")}
          onKeyDown={onTabKeyDown}
        >
          {HERO_SCENES.map((scene, i) => {
            const selected = i === active;
            return (
              <button
                key={scene.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                className="ph-preview__tab"
                aria-selected={selected}
                aria-controls="ph-preview-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
              >
                {t(scene.label)}
                {selected && !reduceMotion ? (
                  <span
                    key={active}
                    className="ph-preview__progress"
                    style={{ animationDuration: `${ROTATE_MS}ms` }}
                    onAnimationEnd={advance}
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        {!reduceMotion ? (
          <button
            type="button"
            className="ph-preview__pause"
            aria-pressed={userPaused}
            aria-label={userPaused ? t("Play previews") : t("Pause previews")}
            onClick={() => setUserPaused((p) => !p)}
          >
            <FontAwesomeIcon icon={userPaused ? faPlay : faPause} />
          </button>
        ) : null}
      </div>

      <figcaption className="ph-preview__caption">
        <span>{t(current.caption)}</span>
        <Link href={current.href}>
          {t("Open it")}
          <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 6 }} />
        </Link>
      </figcaption>
    </figure>
  );
}
