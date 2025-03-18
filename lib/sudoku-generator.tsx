// Function to generate a valid Sudoku puzzle
export function generateSudokuPuzzle(numCellsToShow: number) {
  // Start with a solved puzzle
  const solution = generateSolvedSudoku()

  // Create a copy to remove numbers from
  const puzzle = solution.map((row) => [...row])

  // Calculate how many cells to hide
  const totalCells = 81
  const numCellsToHide = totalCells - numCellsToShow

  // Randomly hide cells
  let hiddenCells = 0
  while (hiddenCells < numCellsToHide) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)

    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null
      hiddenCells++
    }
  }

  return { puzzle, solution }
}

// Function to generate a solved Sudoku board
function generateSolvedSudoku() {
  // Create an empty 9x9 grid
  const grid: number[][] = Array(9)
    .fill(null)
    .map(() => Array(9).fill(null))

  // Fill the grid with a valid solution
  solveSudoku(grid)

  return grid
}

// Backtracking algorithm to solve Sudoku
function solveSudoku(grid: number[][]) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      // Find an empty cell
      if (grid[row][col] === null) {
        // Try placing numbers 1-9
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        // Shuffle the numbers for randomness
        numbers.sort(() => Math.random() - 0.5)

        for (const num of numbers) {
          // Check if placing num at (row, col) is valid
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num

            // Recursively try to solve the rest of the grid
            if (solveSudoku(grid)) {
              return true
            }

            // If we couldn't solve with this number, backtrack
            grid[row][col] = null
          }
        }

        // If no number works, trigger backtracking
        return false
      }
    }
  }

  // If we've filled all cells, we've solved the puzzle
  return true
}

// Check if placing a number at a position is valid
function isValidPlacement(grid: number[][], row: number, col: number, num: number) {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) {
      return false
    }
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) {
      return false
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[boxRow + r][boxCol + c] === num) {
        return false
      }
    }
  }

  return true
}

