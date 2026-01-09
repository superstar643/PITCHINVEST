import * as React from "react"
import { Spinner } from "./spinner"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
  fullScreen?: boolean
}

/**
 * Standardized loading spinner component with "Loading..." text
 * Matches the project's design system and replaces all small spinners
 */
export function LoadingSpinner({ 
  message = "Loading...", 
  fullScreen = false,
  className,
  ...props 
}: LoadingSpinnerProps) {
  const content = (
    <div className={cn("flex flex-col items-center gap-4", className)} {...props}>
      <Spinner size="xl" variant="primary" />
      <p className="text-sm text-gray-600 font-medium">{message}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      {content}
    </div>
  )
}
