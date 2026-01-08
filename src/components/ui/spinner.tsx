import * as React from "react"
import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "primary" | "white"
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", variant = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4 border-2",
      md: "w-8 h-8 border-2",
      lg: "w-12 h-12 border-[3px]",
      xl: "w-16 h-16 border-4",
    }

    const variantClasses = {
      default: "border-gray-200 border-t-gray-600",
      primary: "border-[#0a3d5c]/20 border-t-[#0a3d5c]",
      white: "border-white/30 border-t-white",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-block rounded-full animate-spin",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Spinner.displayName = "Spinner"

export { Spinner }

