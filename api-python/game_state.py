"""In-memory game sessions for solo mode."""

import random
import uuid
from dataclasses import dataclass, field
from typing import Optional, List, Set, Dict

from models import PokemonData

AI_NAMES = ["Professor Oak", "Misty AI", "Brock Bot", "Nurse Joy AI"]

GUESS_THRESHOLD = 3  # AI guesses when candidates <= this


@dataclass
class ChatMessage:
    role: str
    content: str

    def to_dict(self) -> dict:
        return {"role": self.role, "content": self.content}


@dataclass
class GameSession:
    session_id: str
    player_name: str
    ai_name: str
    seed: int
    pokemon_list: List[PokemonData]
    _ai_secret_id: int  # immutable after creation
    human_secret_id: Optional[int] = None
    phase: str = "picking_secret"
    turn_number: int = 0
    ai_candidates: Set[int] = field(default_factory=set)
    chat_history: List[ChatMessage] = field(default_factory=list)
    winner: Optional[str] = None
    pending_ai_question: Optional[str] = None

    @property
    def ai_secret_id(self) -> int:
        return self._ai_secret_id

    def get_chat_dicts(self) -> List[dict]:
        return [m.to_dict() for m in self.chat_history]

    def get_candidate_names(self) -> List[dict]:
        """Return only IDs and names of remaining candidates. No attributes."""
        return [
            {"id": p.id, "name": p.name}
            for p in self.pokemon_list
            if p.id in self.ai_candidates
        ]

    def get_all_pokemon_names(self) -> List[dict]:
        """Return only IDs and names of all 40 pokemon. No attributes."""
        return [{"id": p.id, "name": p.name} for p in self.pokemon_list]

    def increment_turn(self):
        self.turn_number += 1


# In-memory store
sessions: Dict[str, GameSession] = {}


def create_session(player_name: str, seed: int, pokemon_list: List[PokemonData]) -> GameSession:
    session_id = uuid.uuid4().hex[:8]
    ai_name = random.choice(AI_NAMES)

    ai_secret = random.choice(pokemon_list)
    all_ids = {p.id for p in pokemon_list}

    session = GameSession(
        session_id=session_id,
        player_name=player_name,
        ai_name=ai_name,
        seed=seed,
        pokemon_list=pokemon_list,
        _ai_secret_id=ai_secret.id,
        ai_candidates=all_ids,
    )
    sessions[session_id] = session
    return session


def get_session(session_id: str) -> Optional[GameSession]:
    return sessions.get(session_id)
