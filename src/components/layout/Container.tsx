import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ContainerSize = "default" | "wide" | "narrow";

const sizes: Record<ContainerSize, string> = {
  default: "max-w-[var(--container)]",
  wide: "max-w-[var(--container-wide)]",
  narrow: "max-w-3xl",
};

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: ContainerSize;
  as?: "div" | "section" | "article" | "main";
}

export function Container({
  children,
  className,
  size = "default",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizes[size],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
