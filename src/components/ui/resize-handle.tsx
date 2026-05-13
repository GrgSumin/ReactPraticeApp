"use client";

import { Separator } from "react-resizable-panels";
import { cn } from "@/lib/utils";

interface Props {
  orientation: "horizontal" | "vertical";
  className?: string;
}

export function ResizeHandle({ orientation, className }: Props) {
  const isHorizontal = orientation === "horizontal";
  return (
    <Separator
      className={cn(
        "shrink-0 bg-border outline-none transition-colors",
        "[&[data-separator=hover]]:bg-primary/50",
        "[&[data-separator=active]]:bg-primary",
        "[&[data-separator=focus]]:bg-primary",
        isHorizontal ? "w-[3px] cursor-col-resize" : "h-[3px] cursor-row-resize",
        className,
      )}
    />
  );
}
