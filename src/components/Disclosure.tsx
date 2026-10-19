import type { ReactNode } from "react";

/** Native <details> panel with a hairline divider and a plus/cross marker. */
export default function Disclosure({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-b">
      <summary className="eyebrow flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden
          className="text-base leading-none font-light transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="text-muted pb-6">{children}</div>
    </details>
  );
}
