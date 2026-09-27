"use client";
// A client-side navigation fetches the next route's RSC payload
// (`/<route>.txt?_rsc=…`) before anything changes on screen. On the GitHub
// Pages export that request sometimes stays pending, so a click on a link —
// the account menu, a simulation card — looks ignored and the reader clicks
// again, starting another fetch that can hang the same way.
//
// This watchdog listens for clicks on internal links (capture phase, so it
// sees them before next/link cancels the native navigation). It shows the
// progress bar (`html[data-navigating]`, styled in navigation-progress.css)
// and, if the URL still hasn't moved after NAV_TIMEOUT_MS, falls back to a
// full page load of the same URL, which the static export always serves.

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const NAV_TIMEOUT_MS = 4000;

const normalize = (path: string) => path.replace(/\/+$/, "") || "/";

let timer: ReturnType<typeof setTimeout> | null = null;

function stop() {
  if (timer) clearTimeout(timer);
  timer = null;
  delete document.documentElement.dataset.navigating;
}

function start(target: URL) {
  stop();
  document.documentElement.dataset.navigating = "";
  timer = setTimeout(() => {
    timer = null;
    if (normalize(window.location.pathname) === normalize(target.pathname)) {
      stop();
    } else {
      window.location.assign(target.href);
    }
  }, NAV_TIMEOUT_MS);
}

function handleClick(event: MouseEvent) {
  if (event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const target = event.target as Element | null;
  const anchor = target?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (anchor.target && anchor.target !== "_self") return;
  if (anchor.hasAttribute("download")) return;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  // Same page (hash jumps, query-only filter links): nothing to fetch.
  if (normalize(url.pathname) === normalize(window.location.pathname)) return;

  start(url);
}

export default function NavigationWatchdog() {
  const pathname = usePathname();

  // The route committed: the navigation went through.
  useEffect(() => {
    stop();
  }, [pathname]);

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    window.addEventListener("pagehide", stop);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("pagehide", stop);
      stop();
    };
  }, []);

  return <div className="nav-progress" aria-hidden="true" />;
}
