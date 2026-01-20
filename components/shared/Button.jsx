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
    primary: "lux-cta-primary",
    secondary: "lux-cta-ghost",
    danger: "bg-red-600 text-white hover:bg-red-500",
  };

  const sizes = {
    small: "px-3 py-1 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  const isCtaVariant = variant === "primary" || variant === "secondary";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "transition disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant] || styles.primary,
        isCtaVariant ? "" : (sizes[size] || sizes.medium),
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}





