"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, type = "text", ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hasError = Boolean(error);

  return (
    <div className="flex w-full flex-col gap-2">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-footnote font-bold text-ink-secondary"
        >
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        type={type}
        aria-invalid={hasError || undefined}
        aria-describedby={
          hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        className={cn(
          "h-[50px] w-full rounded-md bg-bg-elevated px-4 text-callout text-ink",
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
          id={`${inputId}-error`}
          className="text-footnote text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-footnote text-ink-tertiary">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
