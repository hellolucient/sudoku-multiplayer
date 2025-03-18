"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ScorePopupProps {
  score: number
  position: { x: number; y: number }
  onComplete: () => void
}

export default function ScorePopup({ score, position, onComplete }: ScorePopupProps) {
  const [visible, setVisible] = useState(true)

  // Make the popup disappear after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete()
    }, 1500) // Match with animation duration

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) return null

  return (
    <div
      className={cn(
        "absolute animate-score-popup z-50 px-2 py-1 rounded-md text-white font-bold",
        score > 0 ? "bg-green-500" : "bg-red-500"
      )}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {score > 0 ? `+${score}` : score}
    </div>
  )
} 