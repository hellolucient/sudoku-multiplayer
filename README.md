# Multiplayer Sudoku Game

A unique twist on the classic Sudoku puzzle game, where you compete against a computer opponent using a hand of number tiles.

## Features

- **Multiplayer Mode**: Play against a computer opponent
- **Tile-Based Gameplay**: Place tiles from your hand onto the board
- **Scoring System**: Earn points for correct placements and completing rows, columns, and boxes
- **Difficulty Levels**: Choose between Easy, Medium, and Hard
- **Responsive Design**: Works on both desktop and mobile devices

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- Radix UI

## Game Rules

1. Each player starts with a hand of 7 number tiles
2. Take turns placing tiles on the board
3. Correct placements earn points equal to the value placed
4. Incorrect placements result in a 10-point penalty
5. Complete a row or column for a 25-point bonus
6. Complete a 3x3 box for a 50-point bonus
7. Game ends when the board is filled or all tiles are used

## Development

### Prerequisites

- Node.js 18.0 or higher
- pnpm (recommended) or npm

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/sudoku-game.git

# Navigate to the project directory
cd sudoku-game

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

## Deployment

This project is deployed on Vercel.

## License

MIT 