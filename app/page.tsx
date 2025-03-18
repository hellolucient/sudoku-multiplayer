import SudokuGame from "@/components/sudoku-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-2 md:p-8">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-center mb-2 md:mb-4">Multiplayer Sudoku</h1>
        <SudokuGame />
      </div>
    </main>
  )
}

