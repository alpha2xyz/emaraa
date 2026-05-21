import * as React from "react"

export function TooltipProvider({ children }: { children: React.ReactNode; delayDuration?: number; skipDelayDuration?: number; disableHoverableContent?: boolean }) {
  return <>{children}</>
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function TooltipTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return <>{children}</>
}

export function TooltipContent({ children, side, align, hidden, sideOffset, className }: { children?: React.ReactNode; side?: string; align?: string; hidden?: boolean; sideOffset?: number; className?: string }) {
  return null
}
