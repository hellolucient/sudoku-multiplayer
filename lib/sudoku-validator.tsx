// Check if a placement is valid according to Sudoku rules
export function checkValidPlacement(solution: number[][], row: number, col: number, num: number) {
  return solution[row][col] === num
}

// Check if a row is complete (all cells filled)
export function isRowComplete(board: (number | null)[][], row: number) {
  return !board[row].some((cell) => cell === null)
}

// Check if a column is complete (all cells filled)
export function isColumnComplete(board: (number | null)[][], col: number) {
  for (let row = 0; row < 9; row++) {
    if (board[row][col] === null) {
      return false
    }
  }
  return true
}

// Check if a 3x3 box is complete (all cells filled)
export function isBoxComplete(board: (number | null)[][], boxRow: number, boxCol: number) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[boxRow * 3 + row][boxCol * 3 + col] === null) {
        return false
      }
    }
  }
  return true
}

