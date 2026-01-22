# Pokemon Guess Who 🎮

A two-player online guessing game based on the classic "Guess Who?" game, featuring Pokemon from generations 1-5.

## Features

- 🎯 **Two-player online gameplay** with real-time synchronization
- 🌍 **Bilingual support** (English/French) for UI and Pokemon names
- 🎨 **Theme switching** (Light/Dark mode)
- 📱 **Responsive design** with configurable grid layouts (8×5 or 5×8)
- 🎲 **Seeded random generation** ensures both players see the same 40 Pokemon
- 🔍 **Rich Pokemon data** including types, generation, and evolution stage
- ⚡ **Fast loading** with static name translations (no runtime API calls for names)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Data Source**: PokéAPI
- **Real-time**: Server-Sent Events (SSE)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/harlet-victorien/pokemon-guess-who.git
cd pokemon-guess-who

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## How to Play

1. **Create or Join a Room**: Enter your name and a room code
2. **Wait for Opponent**: Share the room code with a friend
3. **Start Playing**: Both players see the same grid of 40 Pokemon
4. **Ask Questions**: Verbally ask yes/no questions about your opponent's Pokemon
5. **Eliminate Cards**: Click on Pokemon to mark them as eliminated
6. **Win**: Be the first to correctly guess your opponent's Pokemon!

## Project Structure

```
pokemon-guess-who/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── contexts/               # React Context (settings, language)
├── lib/                    # Utilities and data fetching
│   ├── translations.ts    # UI translations (EN/FR)
│   ├── pokemon-names.ts   # Static Pokemon name translations
│   ├── pokemon.ts         # PokéAPI integration
│   └── rng.ts            # Seeded random number generation
├── scripts/               # Build scripts
│   └── generate-pokemon-names.js
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## Translation System

The app features a dual-layer translation system:

- **UI Translations**: Lightweight custom i18n for interface text
- **Pokemon Names**: Static mapping of 649 Pokemon names (EN/FR) generated from PokéAPI

To regenerate Pokemon name translations:

```bash
node scripts/generate-pokemon-names.js
```

## Configuration

Settings are persisted in localStorage:
- Language preference (EN/FR)
- Theme (Light/Dark)
- Grid layout (8×5 or 5×8)

## API Routes

- `POST /api/room/[code]` - Create room
- `POST /api/room/[code]/join` - Join room
- `GET /api/room/[code]` - Room status (SSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- Pokemon data provided by [PokéAPI](https://pokeapi.co/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Type icons and sprites from Pokemon official sources
