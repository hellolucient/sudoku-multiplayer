"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"

type PlayerHandProps = {
  tiles: number[]
  onTileSelect: (index: number) => void
  disabled: boolean
}

export default function PlayerHand({ tiles, onTileSelect, disabled }: PlayerHandProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  return (
    <div className="flex gap-1 md:gap-3 justify-center my-4">
      {tiles.map((tile, index) => (
        <button
          key={index}
          className={cn(
            "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-sm md:text-lg font-medium rounded-md",
            "transition-all duration-200 transform shadow-lg", 
            hoverIndex === index ? "scale-110" : "scale-100",
            disabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "tile-container text-white hover:scale-105 cursor-pointer", 
          )}
          onClick={() => !disabled && onTileSelect(index)}
          onMouseEnter={() => setHoverIndex(index)}
          onMouseLeave={() => setHoverIndex(null)}
          disabled={disabled}
        >
          {tile}
        </button>
      ))}
    </div>
  )
}

