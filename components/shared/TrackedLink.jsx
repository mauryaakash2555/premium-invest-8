"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export default function TrackedLink({
  href,
  className,
  eventName,
  eventParams,
  children,
  ...props
}) {
  const handleClick = () => {
    if (!eventName) return;
    trackEvent(eventName, eventParams || {});
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
