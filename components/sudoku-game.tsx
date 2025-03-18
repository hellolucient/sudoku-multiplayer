"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SudokuBoard from "./sudoku-board"
import PlayerHand from "./player-hand"
import { generateSudokuPuzzle } from "@/lib/sudoku-generator"
import { checkValidPlacement, isRowComplete, isColumnComplete, isBoxComplete } from "@/lib/sudoku-validator"
import { cn } from "@/lib/utils"
import SoundToggle from "@/components/sound-toggle"
import { 
  playPlaceSound, 
  playErrorSound, 
  playCompleteSound, 
  playSelectSound,
  playWinSound,
  playLoseSound,
  playComputerMoveSound
} from "@/lib/sound-effects"
import ScorePopup from "./score-popup"

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
  const [scorePopups, setScorePopups] = useState<Array<{ id: number; score: number; position: { x: number; y: number } }>>([])
  const [nextPopupId, setNextPopupId] = useState(0)

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

    playSelectSound()
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
      playPlaceSound()
      // Update the board permanently for valid moves
      newBoard[row][col] = number

      // Check for completions and collect them
      const newCompletedSections: CompletedSection[] = []

      // Check row completion
      if (isRowComplete(newBoard, row)) {
        playCompleteSound()
        scoreChange += 25
        message += " Row complete! +25 bonus points."
        newCompletedSections.push({ type: "row", index: row })
      }

      // Check column completion
      if (isColumnComplete(newBoard, col)) {
        playCompleteSound()
        scoreChange += 25
        message += " Column complete! +25 bonus points."
        newCompletedSections.push({ type: "column", index: col })
      }

      // Check box completion
      const boxRow = Math.floor(row / 3)
      const boxCol = Math.floor(col / 3)
      if (isBoxComplete(newBoard, boxRow, boxCol)) {
        playCompleteSound()
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

      showScorePopup(scoreChange, selectedCell)
    } else {
      playErrorSound()
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

    // Check if game should end
    const gameOver = shouldGameEnd(newBoard, updatedPlayers[0].hand, updatedPlayers[1].hand, newPool)

    setGameState({
      ...gameState,
      board: newBoard,
      players: updatedPlayers,
      pool: newPool,
      currentPlayer: 1, // Switch to computer's turn
      gameOver,
      message: gameOver ? determineWinner(updatedPlayers) : message + " Your turn!",
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
        playComputerMoveSound()
        // Update the board permanently for valid moves
        newBoard[move.row][move.col] = move.number

        // Check for completions and collect them
        const newCompletedSections: CompletedSection[] = []

        // Check row completion
        if (isRowComplete(newBoard, move.row)) {
          playCompleteSound()
          scoreChange += 25
          message += " Row complete! +25 bonus points."
          newCompletedSections.push({ type: "row", index: move.row })
        }

        // Check column completion
        if (isColumnComplete(newBoard, move.col)) {
          playCompleteSound()
          scoreChange += 25
          message += " Column complete! +25 bonus points."
          newCompletedSections.push({ type: "column", index: move.col })
        }

        // Check box completion
        const boxRow = Math.floor(move.row / 3)
        const boxCol = Math.floor(move.col / 3)
        if (isBoxComplete(newBoard, boxRow, boxCol)) {
          playCompleteSound()
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
        playErrorSound()
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

      showScorePopup(scoreChange, [move.row, move.col])
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
    const player1Score = players[0].score
    const player2Score = players[1].score

    let message = ""

    if (player1Score > player2Score) {
      playWinSound()
      message = `You win! Final score: ${player1Score} to ${player2Score}.`
    } else if (player1Score < player2Score) {
      playLoseSound()
      message = `Computer wins! Final score: ${player2Score} to ${player1Score}.`
    } else {
      message = `It's a tie! Final score: ${player1Score} each.`
    }
    
    setGameState((prev) => (prev ? { ...prev, gameOver: true, message: message } : null))
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

  const showScorePopup = (score: number, cellCoords?: [number, number]) => {
    // Default position in the center of the board
    let position = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    // If cell coordinates are provided, use a position relative to the screen
    if (cellCoords) {
      position = { 
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2 - 50 
      }
    }

    // Add new popup
    const newPopup = {
      id: nextPopupId,
      score,
      position
    }
    
    setScorePopups(prev => [...prev, newPopup])
    setNextPopupId(prev => prev + 1)
  }

  return (
    <div className="flex flex-col w-full">
      {!gameState ? (
        <div className="flex flex-col gap-4 my-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="difficulty" className="text-sm font-medium text-muted-foreground">
              Difficulty Level
            </label>
            <Select
              value={difficulty}
              onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}
            >
              <SelectTrigger id="difficulty" className="w-full bg-white">
                <SelectValue placeholder="Select Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={startNewGame} className="w-full font-medium">
            Start New Game
          </Button>
        </div>
      ) : (
        <>
          {/* Game board */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Difficulty</span>
                <span className="font-medium capitalize">{difficulty}</span>
              </div>
              <div className="flex items-center gap-2">
                <SoundToggle />
                <Button onClick={startNewGame} className="bg-white border border-gray-200 text-sm">
                  New Game
                </Button>
              </div>
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
          </div>

          {/* Player hands */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {gameState.players.map((player, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg",
                  gameState.currentPlayer === index ? "bg-primary/5 border-primary border" : "bg-gray-50 border-gray-200 border"
                )}
              >
                <div className="text-sm font-medium mb-1 flex items-center gap-1">
                  <span>{player.name}</span>
                  {gameState.currentPlayer === index && !gameState.gameOver && (
                    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  )}
                </div>
                <div className="text-lg font-bold text-primary">{player.score}</div>
              </div>
            ))}
          </div>

          {/* Game message */}
          <div className="game-message">
            <p>{gameState.message}</p>
          </div>

          {/* Current player's hand */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-center mb-2">Your Tiles</h3>
            <PlayerHand
              tiles={gameState.players[0].hand}
              onTileSelect={handleTileSelect}
              disabled={gameState.currentPlayer !== 0 || gameState.gameOver}
            />
          </div>

          {/* Score popups */}
          {scorePopups.map(popup => (
            <ScorePopup
              key={popup.id}
              score={popup.score}
              position={popup.position}
              onComplete={() => {
                setScorePopups(prev => prev.filter(p => p.id !== popup.id))
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}

