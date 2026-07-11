/**
 * AmbientBackground — the landing page's "Arctic Depths" ambient effect,
 * extracted into one reusable, whole-page layer.
 *
 * Renders a single fixed, full-viewport layer behind all page content:
 *   A) diagonal base gradient
 *   B) faint dot-grid overlay
 *   C) a soft radial glow blob in the top-start corner
 *
 * Colors are the exact values from landing-page.tsx (hero + provider band).
 * `pointer-events-none` + `-z-10` keep it purely decorative and non-interactive.
 * The page's own root should be transparent so this shows through.
 */

type GlowHue = "owner" | "provider" | "white";

const GLOW: Record<GlowHue, string> = {
  // cyan — landing hero glow (rgba of --owner #0DB8D3)
  owner: "radial-gradient(circle, rgba(13,184,211,0.16) 0%, transparent 70%)",
  // blue — role accent (rgba of --provider #1B7FDC)
  provider: "radial-gradient(circle, rgba(27,127,220,0.16) 0%, transparent 70%)",
  // soft white — landing provider band glow
  white: "radial-gradient(circle, rgba(255,255,255,0.09) 0%, transparent 70%)",
};

export default function AmbientBackground({ glow = "owner" }: { glow?: GlowHue }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* A — diagonal base gradient */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, #0f3a47, #0F2733 75%)" }}
      />
      {/* B — faint dot-grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
      />
      {/* C — soft radial glow blob, top-start corner (slow continuous drift) */}
      <div
        className="ambient-glow absolute -top-24 h-[420px] w-[420px] rounded-full start-[-120px]"
        style={{ background: GLOW[glow] }}
      />
    </div>
  );
}
