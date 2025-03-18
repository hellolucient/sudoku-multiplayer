"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SudokuBoard from "./sudoku-board"
import PlayerHand from "./player-hand"
import { generateSudokuPuzzle } from "@/lib/sudoku-generator"
import { checkValidPlacement, isRowComplete, isColumnComplete, isBoxComplete } from "@/lib/sudoku-validator"

type Player = {
  name: string
  score: number
  hand: number[]
}

type GameState = {
  board: (number | null)[][]
  solution: number[][]
  pool: number[]
  currentPlayer: number
  players: Player[]
  gameOver: boolean
  message: string
}

type CompletedSection = {
  type: "row" | "column" | "box"
  index: number
  boxRow?: number
  boxCol?: number
}

const DIFFICULTY_LEVELS = {
  easy: 40,
  medium: 30,
  hard: 20,
}

export default function SudokuGame() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [invalidCells, setInvalidCells] = useState<Array<[number, number]>>([])
  const [invalidCell, setInvalidCell] = useState<[number, number, number] | null>(null)
  const [computerSelectedCell, setComputerSelectedCell] = useState<[number, number] | null>(null)
  const [completedSections, setCompletedSections] = useState<CompletedSection[]>([])

  // Initialize or reset the game
  const startNewGame = () => {
    const { puzzle, solution } = generateSudokuPuzzle(DIFFICULTY_LEVELS[difficulty])

    // Create a pool of remaining numbers
    const pool: number[] = []
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (puzzle[i][j] === null) {
          pool.push(solution[i][j])
        }
      }
    }

    // Shuffle the pool
    pool.sort(() => Math.random() - 0.5)

    // Create player hands
    const playerHand = pool.splice(0, 7)
    const computerHand = pool.splice(0, 7)

    setGameState({
      board: puzzle,
      solution,
      pool,
      currentPlayer: 0, // 0 for player, 1 for computer
      players: [
        { name: "You", score: 0, hand: playerHand },
        { name: "Computer", score: 0, hand: computerHand },
      ],
      gameOver: false,
      message: "Your turn! Select a cell and then a number from your hand.",
    })

    setSelectedCell(null)
    setInvalidCells([])
    setCompletedSections([])
  }

  // Count empty cells on the board
  const countEmptyCells = (board: (number | null)[][]) => {
    let count = 0
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === null) {
          count++
        }
      }
    }
    return count
  }

  // Check if the game should end
  const shouldGameEnd = (board: (number | null)[][], player1Hand: number[], player2Hand: number[], pool: number[]) => {
    // Game ends when the board is full
    const emptyCells = countEmptyCells(board)
    if (emptyCells === 0) return true

    // Game ends when both players have no tiles and the pool is empty
    if (player1Hand.length === 0 && player2Hand.length === 0 && pool.length === 0) return true

    // Game should not end if there are empty cells and tiles available
    return false
  }

  // Handle player's move
  const handleCellSelect = (row: number, col: number) => {
    if (!gameState || gameState.gameOver || gameState.currentPlayer !== 0) return
    if (gameState.board[row][col] !== null) return

    setSelectedCell([row, col])
  }

  // Handle tile selection from player's hand
  const handleTileSelect = (index: number) => {
    if (!gameState || !selectedCell || gameState.gameOver || gameState.currentPlayer !== 0) return

    const [row, col] = selectedCell
    const number = gameState.players[0].hand[index]

    // Remove the tile from player's hand
    const updatedPlayerHand = [...gameState.players[0].hand]
    updatedPlayerHand.splice(index, 1)

    // Check if placement is valid
    const isValid = checkValidPlacement(gameState.solution, row, col, number)

    // Update score
    let scoreChange = isValid ? number : -10
    let message = isValid ? `You placed ${number} correctly! +${number} points.` : `Invalid placement! -10 points.`

    // Create a temporary board for animation
    const newBoard = gameState.board.map((r) => [...r])
    const newPool = [...gameState.pool]
    const updatedPlayers = [...gameState.players]

    if (isValid) {
      // Update the board permanently for valid moves
      newBoard[row][col] = number

      // Check for completions and collect them
      const newCompletedSections: CompletedSection[] = []

      // Check row completion
      if (isRowComplete(newBoard, row)) {
        scoreChange += 25
        message += " Row complete! +25 bonus points."
        newCompletedSections.push({ type: "row", index: row })
      }

      // Check column completion
      if (isColumnComplete(newBoard, col)) {
        scoreChange += 25
        message += " Column complete! +25 bonus points."
        newCompletedSections.push({ type: "column", index: col })
      }

      // Check box completion
      const boxRow = Math.floor(row / 3)
      const boxCol = Math.floor(col / 3)
      if (isBoxComplete(newBoard, boxRow, boxCol)) {
        scoreChange += 50
        message += " Box complete! +50 bonus points."
        newCompletedSections.push({ type: "box", index: boxRow * 3 + boxCol, boxRow, boxCol })
      }

      // If there are completed sections, show the animation
      if (newCompletedSections.length > 0) {
        setCompletedSections(newCompletedSections)

        // Clear the completed sections after animation
        setTimeout(() => {
          setCompletedSections([])
        }, 1800) // 3 flashes at 600ms each
      }
    } else {
      // For invalid moves, we'll show the number temporarily for animation
      // but it won't be permanently added to the board
      setInvalidCell([row, col, number])

      // If pool is empty, give the tile to the opponent
      if (newPool.length === 0) {
        updatedPlayers[1].hand.push(number)
        message += " Tile given to opponent."
      } else {
        // Otherwise return the tile to the pool
        newPool.push(number)
        // Shuffle the pool
        newPool.sort(() => Math.random() - 0.5)
        message += " Tile returned to pool."
      }

      // Clear the invalid cell after animation
      setTimeout(() => {
        setInvalidCell(null)
      }, 1500)
    }

    // Update player's score and hand
    updatedPlayers[0] = {
      ...updatedPlayers[0],
      score: updatedPlayers[0].score + scoreChange,
      hand: updatedPlayerHand,
    }

    // Draw a new tile if possible
    if (newPool.length > 0) {
      const newTile = newPool.pop()
      updatedPlayers[0].hand.push(newTile!)
      message += " Drew a new tile."
    }

    // Check if game should end
    const gameOver = shouldGameEnd(newBoard, updatedPlayers[0].hand, updatedPlayers[1].hand, newPool)

    setGameState({
      ...gameState,
      board: newBoard,
      players: updatedPlayers,
      pool: newPool,
      currentPlayer: 1, // Switch to computer's turn
      message,
      gameOver,
    })

    setSelectedCell(null)

    // If game is over, show winner
    if (gameOver) {
      endGame(updatedPlayers)
    }
  }

  // Computer's turn
  useEffect(() => {
    if (!gameState || gameState.gameOver || gameState.currentPlayer !== 1) return

    // Add a delay to make the computer's move more natural
    const timeoutId = setTimeout(() => {
      computerMove()
    }, 1500)

    return () => clearTimeout(timeoutId)
  }, [gameState])

  const computerMove = () => {
    if (!gameState) return

    // Find valid moves
    const validMoves: Array<{ row: number; col: number; number: number; index: number }> = []

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (gameState.board[i][j] === null) {
          gameState.players[1].hand.forEach((number, index) => {
            if (checkValidPlacement(gameState.solution, i, j, number)) {
              validMoves.push({ row: i, col: j, number, index })
            }
          })
        }
      }
    }

    // If no valid moves, make a random move
    let move
    let isValid = false

    if (validMoves.length > 0) {
      // Choose a random valid move
      move = validMoves[Math.floor(Math.random() * validMoves.length)]
      isValid = true
    } else {
      // Make a random move
      const emptyCells: Array<[number, number]> = []
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (gameState.board[i][j] === null) {
            emptyCells.push([i, j])
          }
        }
      }

      if (emptyCells.length === 0 || gameState.players[1].hand.length === 0) {
        // No moves possible
        drawTilesAndSwitchTurn()
        return
      }

      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      const handIndex = Math.floor(Math.random() * gameState.players[1].hand.length)
      const number = gameState.players[1].hand[handIndex]

      move = { row, col, number, index: handIndex }
    }

    // Show the computer's selected cell
    setComputerSelectedCell([move.row, move.col])

    // Delay the actual move to show the selection
    setTimeout(() => {
      // Update the board
      const newBoard = gameState.board.map((r) => [...r])

      // Remove the tile from computer's hand
      const updatedComputerHand = [...gameState.players[1].hand]
      updatedComputerHand.splice(move.index, 1)

      // Update score
      let scoreChange = isValid ? move.number : -10
      let message = isValid
        ? `Computer placed ${move.number} correctly! +${move.number} points.`
        : `Computer made an invalid placement! -10 points.`

      const newPool = [...gameState.pool]
      const updatedPlayers = [...gameState.players]

      // Update computer's hand
      updatedPlayers[1] = {
        ...updatedPlayers[1],
        score: updatedPlayers[1].score + scoreChange,
        hand: updatedComputerHand,
      }

      if (isValid) {
        // Update the board permanently for valid moves
        newBoard[move.row][move.col] = move.number

        // Check for completions and collect them
        const newCompletedSections: CompletedSection[] = []

        // Check row completion
        if (isRowComplete(newBoard, move.row)) {
          scoreChange += 25
          message += " Row complete! +25 bonus points."
          newCompletedSections.push({ type: "row", index: move.row })
        }

        // Check column completion
        if (isColumnComplete(newBoard, move.col)) {
          scoreChange += 25
          message += " Column complete! +25 bonus points."
          newCompletedSections.push({ type: "column", index: move.col })
        }

        // Check box completion
        const boxRow = Math.floor(move.row / 3)
        const boxCol = Math.floor(move.col / 3)
        if (isBoxComplete(newBoard, boxRow, boxCol)) {
          scoreChange += 50
          message += " Box complete! +50 bonus points."
          newCompletedSections.push({ type: "box", index: boxRow * 3 + boxCol, boxRow, boxCol })
        }

        // If there are completed sections, show the animation
        if (newCompletedSections.length > 0) {
          setCompletedSections(newCompletedSections)

          // Clear the completed sections after animation
          setTimeout(() => {
            setCompletedSections([])
          }, 1800) // 3 flashes at 600ms each
        }

        // Update computer's score with bonuses
        updatedPlayers[1].score = updatedPlayers[1].score + scoreChange - move.number // We already added the tile value
      } else {
        // For invalid moves, show animation but don't update board
        setInvalidCell([move.row, move.col, move.number])

        // If pool is empty, give the tile to the opponent (player)
        if (newPool.length === 0) {
          updatedPlayers[0].hand.push(move.number)
          message += " Tile given to you."
        } else {
          // Otherwise return the tile to the pool
          newPool.push(move.number)
          // Shuffle the pool
          newPool.sort(() => Math.random() - 0.5)
          message += " Tile returned to pool."
        }

        // Clear the invalid cell after animation
        setTimeout(() => {
          setInvalidCell(null)
        }, 1500)
      }

      // Draw a new tile if possible
      if (newPool.length > 0) {
        const newTile = newPool.pop()
        updatedPlayers[1].hand.push(newTile!)
        message += " Computer drew a new tile."
      }

      // Check if game should end
      const gameOver = shouldGameEnd(newBoard, updatedPlayers[0].hand, updatedPlayers[1].hand, newPool)

      setGameState({
        ...gameState,
        board: newBoard,
        players: updatedPlayers,
        pool: newPool,
        currentPlayer: 0, // Switch back to player's turn
        gameOver,
        message: gameOver ? determineWinner(updatedPlayers) : message + " Your turn!",
      })

      setComputerSelectedCell(null)

      // If game is over, show winner
      if (gameOver) {
        endGame(updatedPlayers)
      }
    }, 1000)
  }

  // Draw tiles and switch turn if no moves possible
  const drawTilesAndSwitchTurn = () => {
    if (!gameState) return

    const updatedGameState = { ...gameState }
    const currentPlayerIndex = updatedGameState.currentPlayer
    const nextPlayerIndex = currentPlayerIndex === 0 ? 1 : 0

    // Draw tiles if possible
    if (updatedGameState.pool.length > 0) {
      const tilesToDraw = Math.min(
        7 - updatedGameState.players[currentPlayerIndex].hand.length,
        updatedGameState.pool.length,
      )

      if (tilesToDraw > 0) {
        const newTiles = updatedGameState.pool.splice(0, tilesToDraw)
        updatedGameState.players[currentPlayerIndex].hand.push(...newTiles)

        updatedGameState.message = `${updatedGameState.players[currentPlayerIndex].name} drew ${tilesToDraw} new tiles. ${updatedGameState.players[nextPlayerIndex].name}'s turn!`
      }
    }

    updatedGameState.currentPlayer = nextPlayerIndex

    setGameState(updatedGameState)
  }

  // End the game and determine the winner
  const endGame = (players: Player[]) => {
    const winnerMessage = determineWinner(players)
    setGameState((prev) => (prev ? { ...prev, gameOver: true, message: winnerMessage } : null))
  }

  // Determine the winner
  const determineWinner = (players: Player[]) => {
    if (players[0].score > players[1].score) {
      return `Game Over! You win with ${players[0].score} points vs Computer's ${players[1].score} points!`
    } else if (players[1].score > players[0].score) {
      return `Game Over! Computer wins with ${players[1].score} points vs your ${players[0].score} points!`
    } else {
      return `Game Over! It's a tie with ${players[0].score} points each!`
    }
  }

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      {!gameState ? (
        <div className="flex flex-col gap-3 p-4 md:p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md">
          <h2 className="text-lg md:text-xl font-semibold text-indigo-800">Game Settings</h2>
          <div className="flex flex-col gap-2">
            <label htmlFor="difficulty" className="text-sm font-medium text-indigo-700">
              Difficulty
            </label>
            <Select value={difficulty} onValueChange={(value) => setDifficulty(value as "easy" | "medium" | "hard")}>
              <SelectTrigger id="difficulty" className="bg-white">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={startNewGame} className="bg-indigo-600 hover:bg-indigo-700">
            Start Game
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-1 md:mb-4 p-2 md:p-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg shadow-md">
            <div className="text-base md:text-lg font-semibold">
              {gameState.players[0].name}: {gameState.players[0].score}
            </div>
            <div className="text-base md:text-lg font-semibold">
              {gameState.players[1].name}: {gameState.players[1].score}
            </div>
          </div>

          <div className="p-2 md:p-3 bg-indigo-50 rounded-md mb-2 md:mb-4 border-l-4 border-indigo-500 shadow-sm">
            <p className="text-xs md:text-sm text-indigo-800">{gameState.message}</p>
          </div>

          <SudokuBoard
            board={gameState.board}
            onCellSelect={handleCellSelect}
            selectedCell={selectedCell}
            invalidCell={invalidCell}
            computerSelectedCell={computerSelectedCell}
            completedSections={completedSections}
            currentPlayer={gameState.currentPlayer}
            gameOver={gameState.gameOver}
          />

          <div className="mt-3 md:mt-6">
            <h3 className="text-sm md:text-md font-semibold mb-1 md:mb-3 text-indigo-700">Your Hand</h3>
            <PlayerHand
              tiles={gameState.players[0].hand}
              onTileSelect={handleTileSelect}
              disabled={gameState.currentPlayer !== 0 || !selectedCell || gameState.gameOver}
            />
          </div>

          <div className="mt-2 md:mt-4 flex justify-between text-xs md:text-sm text-indigo-600">
            <div>Pool: {gameState.pool.length} tiles</div>
            <div>Computer: {gameState.players[1].hand.length} tiles</div>
          </div>

          {gameState.gameOver && (
            <Button onClick={startNewGame} className="mt-4 md:mt-6 bg-indigo-600 hover:bg-indigo-700">
              Play Again
            </Button>
          )}
        </>
      )}
    </div>
  )
}

