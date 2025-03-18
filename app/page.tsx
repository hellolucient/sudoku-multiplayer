import SudokuGame from "@/components/sudoku-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-2 md:p-6 bg-gradient-to-b from-violet-50 to-indigo-50">
      <div className="w-full max-w-md mx-auto game-container p-4 md:p-6">
        <div className="game-header mb-4 pb-2 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            Multiplayer Sudoku
          </h1>
          <p className="text-sm text-muted-foreground">Challenge the computer in this strategic tile-placement game</p>
        </div>
        <SudokuGame />
      </div>
    </main>
  )
}

