/**
 * Reusable Input Component
 */

'use client';

export function Input({ value, onChange, placeholder = "", type = "text", disabled = false, className = "", ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={[
        "w-full rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm",
        "outline-none focus:border-[rgba(192,160,98,0.65)]",
        "disabled:opacity-50",
        className,
      ].join(" ")}
      {...rest}
    />
  );
}





