import * as React from "react"
import { Spinner } from "./spinner"
import { cn } from "@/lib/utils"
import { Loader2, Upload, CheckCircle2, Database } from "lucide-react"

interface LoadingOverlayProps {
  isOpen: boolean
  message?: string
  steps?: Array<{ label: string; status: "pending" | "loading" | "completed" }>
}

export function LoadingOverlay({ isOpen, message, steps }: LoadingOverlayProps) {
  if (!isOpen) return null

  const defaultSteps = steps || [
    { label: "Verifying email", status: "loading" as const },
    { label: "Uploading files", status: "pending" as const },
    { label: "Creating account", status: "pending" as const },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Main Spinner */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative">
            <Spinner size="xl" variant="primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#0a3d5c] animate-spin" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {message || "Processing your registration"}
        </h3>
        <p className="text-sm text-gray-600 text-center mb-6">
          This may take a few moments...
        </p>

        {/* Steps */}
        <div className="space-y-3">
          {defaultSteps.map((step, index) => {
            const isCompleted = step.status === "completed"
            const isLoading = step.status === "loading"
            const isPending = step.status === "pending"

            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all",
                  isLoading && "bg-[#0a3d5c]/5 border border-[#0a3d5c]/20",
                  isCompleted && "bg-green-50 border border-green-200",
                  isPending && "bg-gray-50 border border-gray-200"
                )}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : isLoading ? (
                    <Spinner size="sm" variant="primary" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium flex-1",
                    isCompleted && "text-green-700",
                    isLoading && "text-[#0a3d5c]",
                    isPending && "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0a3d5c] rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${
                  (defaultSteps.filter((s) => s.status === "completed").length /
                    defaultSteps.length) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

