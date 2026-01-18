/**
 * Reusable Button Component
 */

'use client';

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  className = "",
  type = "button",
}) {
  const styles = {
    primary: "bg-[rgba(192,160,98,0.95)] text-black hover:bg-[rgba(210,180,120,0.95)]",
    secondary:
      "bg-transparent border border-[rgba(192,160,98,0.65)] text-[rgba(192,160,98,0.95)] hover:bg-[rgba(192,160,98,0.08)]",
    danger: "bg-red-600 text-white hover:bg-red-500",
  };

  const sizes = {
    small: "px-3 py-1 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded transition disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant] || styles.primary,
        sizes[size] || sizes.medium,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}






