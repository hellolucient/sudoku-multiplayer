"use client"

import { cn } from "@/lib/utils"

type PlayerHandProps = {
  tiles: number[]
  onTileSelect: (index: number) => void
  disabled: boolean
}

export default function PlayerHand({ tiles, onTileSelect, disabled }: PlayerHandProps) {
  return (
    <div className="flex gap-1 md:gap-3 justify-center">
      {tiles.map((tile, index) => (
        <button
          key={index}
          className={cn(
            "w-9 h-9 md:w-12 md:h-12 flex items-center justify-center text-sm md:text-lg font-medium rounded-md",
            "transition-all duration-200 shadow-md transform hover:scale-105",
            disabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-br from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 cursor-pointer",
          )}
          onClick={() => !disabled && onTileSelect(index)}
          disabled={disabled}
        >
          {tile}
        </button>
      ))}
    </div>
  )
}

