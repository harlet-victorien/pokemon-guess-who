export type Language = "en" | "fr"

export const translations = {
  en: {
    // Home page
    title: "Pokemon Guess Who",
    subtitle: "A two-player guessing game with your favorite Pokemon",
    gameDescription: "Create or join a room with a friend. Each player sees the same 40 Pokemon grid and must guess which Pokemon their opponent has chosen by asking yes/no questions.",
    
    // Join form
    joinGame: "Join a Game",
    joinDescription: "Enter your name and a room code to play with a friend",
    yourName: "Your Name",
    enterName: "Enter your name",
    roomCode: "Room Code",
    enterRoomCode: "Enter room code",
    joining: "Joining...",
    join: "Join Game",
    nameError: "Name must be 1-20 characters",
    codeError: "Room code must be 1-10 alphanumeric characters",
    connectionError: "Failed to connect to server",
    joinError: "Failed to join room",
    
    // Lobby
    waitingForOpponent: "Waiting for Opponent",
    shareCode: "Share the room code with your friend to start playing",
    players: "Players",
    waiting: "Waiting...",
    waitingForPlayer: "Waiting for another player to join...",
    waitingForHost: "Waiting for host to start the game...",
    startGame: "Start Game",
    starting: "Starting...",
    
    // Game page
    leaveGame: "Leave Game",
    loadingRoom: "Loading room...",
    error: "Error",
    backToHome: "Back to Home",
    roomNotFound: "Room not found",
    
    // Board
    playing: "Playing:",
    remaining: "Remaining:",
    loadingPokemon: "Loading Pokemon...",
    eliminationHint: "Click on a Pokemon to mark it as eliminated. Coordinate with your opponent verbally!",
    partialLoad: "Only loaded {count}/40 Pokemon. Some may not display.",
    loadError: "Failed to load Pokemon data",
    
    // Pokemon info
    generation: "Generation",
    evolutionStage: "Evolution Stage",
    basic: "Basic",
    stage1: "Stage 1",
    stage2: "Stage 2",
    
    // Type legend
    hoverHint: "Hover a card to see Generation and Evolution Stage",
    
    // Language
    language: "Language",
    
    // Settings
    settings: "Settings",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    gridLayout: "Grid Layout",

    // Solo mode
    soloPlay: "Play Solo vs AI",
    soloSubtitle: "Play against an AI opponent powered by Mistral",
    soloStart: "Solo Game",
    soloStartDesc: "Enter your name to start a game against the AI",
    soloLoading: "Starting game...",
    soloPickSecret: "Choose Your Secret Pokemon",
    soloPickSecretDesc: "Pick a Pokemon from the grid. The AI will try to guess it!",
    soloConfirmSecret: "Confirm Secret",
    soloConfirming: "Confirming...",
    soloTurn: "Turn",
    soloYourTurn: "Your Turn",
    soloAiThinking: "AI is thinking...",
    soloAiProcessing: "Analyzing your answer...",
    soloChat: "Game Chat",
    soloAiBoard: "AI Board",
    soloYes: "Yes",
    soloNo: "No",
    soloAsk: "Ask",
    soloAskPlaceholder: "Ask a yes/no question...",
    soloEndTurn: "End Turn",

    soloGuess: "Guess!",
    soloYourSecret: "Your secret",
    soloAiCandidates: "AI candidates",
    soloGameOver: "Game Over!",
    soloWinner: "Winner",
    soloAiSecret: "AI's secret Pokemon was",
  },
  fr: {
    // Home page
    title: "Pokemon Qui est-ce?",
    subtitle: "Un jeu de devinettes a deux joueurs avec vos Pokemon preferes",
    gameDescription: "Creez ou rejoignez une salle avec un ami. Chaque joueur voit la meme grille de 40 Pokemon et doit deviner quel Pokemon son adversaire a choisi en posant des questions oui/non.",
    
    // Join form
    joinGame: "Rejoindre une Partie",
    joinDescription: "Entrez votre nom et un code de salle pour jouer avec un ami",
    yourName: "Votre Nom",
    enterName: "Entrez votre nom",
    roomCode: "Code de Salle",
    enterRoomCode: "Entrez le code de salle",
    joining: "Connexion...",
    join: "Rejoindre",
    nameError: "Le nom doit contenir 1 a 20 caracteres",
    codeError: "Le code doit contenir 1 a 10 caracteres alphanumeriques",
    connectionError: "Impossible de se connecter au serveur",
    joinError: "Impossible de rejoindre la salle",
    
    // Lobby
    waitingForOpponent: "En attente d'un adversaire",
    shareCode: "Partagez le code de salle avec votre ami pour commencer",
    players: "Joueurs",
    waiting: "En attente...",
    waitingForPlayer: "En attente d'un autre joueur...",
    waitingForHost: "En attente que l'hote demarre la partie...",
    startGame: "Demarrer la partie",
    starting: "Demarrage...",
    
    // Game page
    leaveGame: "Quitter la Partie",
    loadingRoom: "Chargement de la salle...",
    error: "Erreur",
    backToHome: "Retour a l'accueil",
    roomNotFound: "Salle non trouvee",
    
    // Board
    playing: "Joueurs:",
    remaining: "Restants:",
    loadingPokemon: "Chargement des Pokemon...",
    eliminationHint: "Cliquez sur un Pokemon pour le marquer comme elimine. Coordonnez-vous verbalement avec votre adversaire!",
    partialLoad: "Seulement {count}/40 Pokemon charges. Certains peuvent ne pas s'afficher.",
    loadError: "Impossible de charger les donnees Pokemon",
    
    // Pokemon info
    generation: "Generation",
    evolutionStage: "Stade d'evolution",
    basic: "Base",
    stage1: "Niveau 1",
    stage2: "Niveau 2",
    
    // Type legend
    hoverHint: "Survolez une carte pour voir la Generation et le Stade d'evolution",
    
    // Language
    language: "Langue",
    
    // Settings
    settings: "Parametres",
    theme: "Theme",
    light: "Clair",
    dark: "Sombre",
    gridLayout: "Disposition",

    // Solo mode
    soloPlay: "Jouer Solo vs IA",
    soloSubtitle: "Jouez contre une IA propulsee par Mistral",
    soloStart: "Partie Solo",
    soloStartDesc: "Entrez votre nom pour jouer contre l'IA",
    soloLoading: "Demarrage...",
    soloPickSecret: "Choisissez Votre Pokemon Secret",
    soloPickSecretDesc: "Choisissez un Pokemon dans la grille. L'IA va essayer de le deviner!",
    soloConfirmSecret: "Confirmer le Secret",
    soloConfirming: "Confirmation...",
    soloTurn: "Tour",
    soloYourTurn: "Votre Tour",
    soloAiThinking: "L'IA reflechit...",
    soloAiProcessing: "Analyse de votre reponse...",
    soloChat: "Chat de Jeu",
    soloAiBoard: "Plateau IA",
    soloYes: "Oui",
    soloNo: "Non",
    soloAsk: "Demander",
    soloAskPlaceholder: "Posez une question oui/non...",
    soloEndTurn: "Fin du Tour",

    soloGuess: "Deviner!",
    soloYourSecret: "Votre secret",
    soloAiCandidates: "Candidats IA",
    soloGameOver: "Partie Terminee!",
    soloWinner: "Gagnant",
    soloAiSecret: "Le Pokemon secret de l'IA etait",
  },
} as const

export type TranslationKey = keyof typeof translations.en
