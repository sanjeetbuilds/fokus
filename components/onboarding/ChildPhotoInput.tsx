"use client";

import { Plus, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

/**
 * Round 80x80 photo picker used in child onboarding Step 1. Reads the
 * selected file, downscales it to a max of 256x256 via a canvas, and
 * returns the resulting base64 data URL. Empty state shows a plus glyph
 * inside an accent-tinted circle; selected state shows the photo with a
 * small × button in the top-right to clear/replace.
 *
 * Photo never leaves the device — we just hold the base64 string in form
 * state and write it to Dexie alongside the rest of the child record.
 */
const MAX_EDGE = 256;
const OUTPUT_TYPE: "image/jpeg" = "image/jpeg";
const OUTPUT_QUALITY = 0.82;

export interface ChildPhotoInputProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  /** Optional label override. Defaults to "Their photo (optional)". */
  label?: string;
}

export default function ChildPhotoInput({
  value,
  onChange,
  label = "Their photo (optional)",
}: ChildPhotoInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setBusy(true);
      try {
        const dataUrl = await downscaleToDataUrl(file);
        onChange(dataUrl);
      } catch (err) {
        console.error("[ChildPhotoInput] downscale:", err);
        setError("Couldn't read that image. Try another.");
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  const onPick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onClear = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onChange(null);
      if (inputRef.current) inputRef.current.value = "";
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-footnote font-extrabold text-ink-secondary">{label}</p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onPick}
          disabled={busy}
          aria-label={
            value ? "Replace photo" : "Add photo"
          }
          className="relative inline-flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
          style={{
            backgroundColor: value ? "transparent" : "var(--accent-bg)",
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <Plus
              size={28}
              strokeWidth={1.75}
              className="text-accent-deep"
              aria-hidden
            />
          )}
        </button>
        <div className="flex flex-col gap-1">
          <p className="text-[13px] text-ink-secondary">
            {value ? "Tap to replace." : "Tap to add."}
          </p>
          <p className="text-[12px] text-ink-tertiary">
            Stays on your device.
          </p>
          {value ? (
            <button
              type="button"
              onClick={onClear}
              className="mt-1 inline-flex items-center gap-1 self-start text-[12px] font-extrabold text-ink-tertiary transition-colors duration-fast ease-out hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              <X size={12} strokeWidth={2} aria-hidden />
              Remove
            </button>
          ) : null}
        </div>
      </div>
      {error ? (
        <p className="text-[12px] text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <p className="text-[12px] text-ink-tertiary">
        Photos never leave your phone. Fokus runs entirely on-device.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
    </div>
  );
}

async function downscaleToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = bitmap;
    const longest = Math.max(width, height);
    const scale = longest > MAX_EDGE ? MAX_EDGE / longest : 1;
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    return canvas.toDataURL(OUTPUT_TYPE, OUTPUT_QUALITY);
  } finally {
    bitmap.close?.();
  }
}
