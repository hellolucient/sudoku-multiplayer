"use client"

import { cn } from "@/lib/utils"

type CompletedSection = {
  type: "row" | "column" | "box"
  index: number
  boxRow?: number
  boxCol?: number
}

type SudokuBoardProps = {
  board: (number | null)[][]
  onCellSelect: (row: number, col: number) => void
  selectedCell: [number, number] | null
  invalidCell: [number, number, number] | null
  computerSelectedCell: [number, number] | null
  completedSections: CompletedSection[]
  currentPlayer: number
  gameOver: boolean
}

export default function SudokuBoard({
  board,
  onCellSelect,
  selectedCell,
  invalidCell,
  computerSelectedCell,
  completedSections,
  currentPlayer,
  gameOver,
}: SudokuBoardProps) {
  const isSelectedCell = (row: number, col: number) => {
    return selectedCell && selectedCell[0] === row && selectedCell[1] === col
  }

  const isComputerSelectedCell = (row: number, col: number) => {
    return computerSelectedCell && computerSelectedCell[0] === row && computerSelectedCell[1] === col
  }

  const isInvalidCell = (row: number, col: number) => {
    return invalidCell && invalidCell[0] === row && invalidCell[1] === col
  }

  const getInvalidCellValue = () => {
    return invalidCell ? invalidCell[2] : null
  }

  const isOriginalCell = (row: number, col: number) => {
    // Original cells are those that were filled at the start of the game
    return board[row][col] !== null
  }

  const isInCompletedSection = (row: number, col: number) => {
    return completedSections.some((section) => {
      if (section.type === "row") {
        return section.index === row
      } else if (section.type === "column") {
        return section.index === col
      } else if (section.type === "box") {
        const boxRow = Math.floor(row / 3)
        const boxCol = Math.floor(col / 3)
        return section.boxRow === boxRow && section.boxCol === boxCol
      }
      return false
    })
  }

  return (
    <div className="sudoku-board-container mb-6">
      <div className="grid grid-cols-9 gap-[1px] bg-indigo-300 p-[1px] md:p-[2px] rounded-md overflow-hidden">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isInvalid = isInvalidCell(rowIndex, colIndex)
            const isCompleted = isInCompletedSection(rowIndex, colIndex)
            const boxRow = Math.floor(rowIndex / 3)
            const boxCol = Math.floor(colIndex / 3)
            const boxShade = (boxRow + boxCol) % 2 === 0 ? "bg-white" : "bg-indigo-50"

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "aspect-square flex items-center justify-center text-sm md:text-lg font-medium",
                  boxShade,
                  "transition-all duration-200 relative",
                  // Border styling for 3x3 boxes
                  (colIndex + 1) % 3 === 0 && colIndex < 8 && "border-r-[1px] md:border-r-2 border-r-indigo-300",
                  (rowIndex + 1) % 3 === 0 && rowIndex < 8 && "border-b-[1px] md:border-b-2 border-b-indigo-300",
                  // Cell state styling
                  isSelectedCell(rowIndex, colIndex) && "bg-blue-100 ring-1 md:ring-2 ring-blue-400",
                  isComputerSelectedCell(rowIndex, colIndex) && "bg-purple-100 ring-1 md:ring-2 ring-purple-400",
                  isOriginalCell(rowIndex, colIndex) && "font-bold text-indigo-800",
                  isCompleted && "animate-completed-cell",
                  cell === null && !gameOver && currentPlayer === 0 && "cursor-pointer hover:bg-blue-50",
                )}
                onClick={() => cell === null && onCellSelect(rowIndex, colIndex)}
              >
                {isInvalid ? getInvalidCellValue() : cell !== null ? cell : ""}

                {/* Localized flash animation for invalid cells */}
                {isInvalid && (
                  <div className="absolute inset-0 flex items-center justify-center animate-incorrect">
                    <div className="text-sm md:text-lg font-medium text-red-600 animate-flash-number">
                      {getInvalidCellValue()}
                    </div>
                  </div>
                )}
                
                {/* Cell selection indicator */}
                {isSelectedCell(rowIndex, colIndex) && (
                  <div className="absolute inset-0 border-2 border-primary rounded-sm opacity-70 animate-pulse-border"></div>
                )}
                
                {/* Computer selection indicator */}
                {isComputerSelectedCell(rowIndex, colIndex) && (
                  <div className="absolute inset-0 border-2 border-accent rounded-sm opacity-70"></div>
                )}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}

