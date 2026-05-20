"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils/cn";

type TextareaInputEvent = Parameters<
  NonNullable<TextareaHTMLAttributes<HTMLTextAreaElement>["onInput"]>
>[0];

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 240;

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, className, value, defaultValue, onInput, ...rest },
  forwardedRef,
) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const hasError = Boolean(error);
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  useImperativeHandle(forwardedRef, () => innerRef.current as HTMLTextAreaElement);

  const resize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, el.scrollHeight));
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, []);

  // Resize on mount and when controlled value changes
  useLayoutEffect(() => {
    resize(innerRef.current);
  }, [resize, value]);

  // Also resize after the browser has filled in defaultValue on first paint
  useEffect(() => {
    resize(innerRef.current);
  }, [resize]);

  const handleInput = (event: TextareaInputEvent) => {
    resize(event.currentTarget);
    onInput?.(event);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {label ? (
        <label
          htmlFor={textareaId}
          className="text-footnote font-extrabold text-ink-secondary"
        >
          {label}
        </label>
      ) : null}
      <textarea
        ref={innerRef}
        id={textareaId}
        value={value}
        defaultValue={defaultValue}
        onInput={handleInput}
        aria-invalid={hasError || undefined}
        aria-describedby={
          hasError
            ? `${textareaId}-error`
            : hint
              ? `${textareaId}-hint`
              : undefined
        }
        style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        className={cn(
          "w-full resize-none rounded-md bg-bg-elevated px-4 py-3 text-callout text-ink",
          "placeholder:text-ink-quaternary",
          "border border-transparent transition-colors duration-fast ease-out",
          "focus:border-accent focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError && "border-danger focus:border-danger",
          className,
        )}
        {...rest}
      />
      {hasError ? (
        <p
          id={`${textareaId}-error`}
          className="text-footnote text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${textareaId}-hint`}
          className="text-footnote text-ink-tertiary"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Textarea;
