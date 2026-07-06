import { useEffect } from "react";

/**
 * Reveals elements marked with [data-reveal] as they enter the viewport by
 * adding the `is-visible` class. Pairs with the [data-reveal] CSS in
 * index.css — motion is disabled there for prefers-reduced-motion users.
 *
 * Pass deps (e.g. [lang]) so a re-render that rebuilds the DOM re-observes
 * the fresh elements.
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (els.length === 0) return;

    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
