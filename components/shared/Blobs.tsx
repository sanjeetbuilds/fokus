/**
 * Decorative blob layer — depth without literal illustration.
 *
 * Three variants, all absolutely positioned, pointer-events:none,
 * z-index 0. Place inside a positioned (relative) parent and put
 * content above with z-index 1 or position:relative.
 *
 *   tile  small skill-tinted tile (other ideas, by-skill grid).
 *         2 blobs in the skill's blob rgba.
 *   stat  Track stat card (full-saturation skill colour bg).
 *         2 blobs in white rgba.
 *   hero  Today hero card (full-saturation skill colour bg).
 *         3 blobs in white rgba.
 */
export type BlobVariant = "tile" | "stat" | "hero";

export interface BlobsProps {
  variant: BlobVariant;
  /** Required for the "tile" variant — the skill's blob rgba. */
  color?: string;
}

export default function Blobs({ variant, color }: BlobsProps) {
  if (variant === "tile") {
    if (!color) return null;
    return (
      <>
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -22,
            right: -18,
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: color,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: -12,
            left: 8,
            width: 55,
            height: 55,
            borderRadius: "50%",
            background: color,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      </>
    );
  }
  if (variant === "stat") {
    return (
      <>
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -22,
            right: -18,
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <span
          aria-hidden
          style={{
            position: "absolute",
            bottom: -12,
            left: 8,
            width: 55,
            height: 55,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      </>
    );
  }
  // hero
  return (
    <>
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: -40,
          right: -30,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.10)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          bottom: -30,
          left: -20,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "40%",
          right: -10,
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.09)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </>
  );
}
