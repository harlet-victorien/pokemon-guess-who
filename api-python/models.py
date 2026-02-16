from typing import Optional, List
from pydantic import BaseModel


class PokemonData(BaseModel):
    id: int
    name: str
    types: List[str]
    generation: int
    evolution_stage: int


class StartGameRequest(BaseModel):
    player_name: str
    seed: int
    pokemon_list: List[PokemonData]


class StartGameResponse(BaseModel):
    session_id: str
    ai_name: str


class SetHumanSecretRequest(BaseModel):
    pokemon_id: int


class GameStateResponse(BaseModel):
    phase: str
    ai_name: str
    turn_number: int
    chat_history: List[dict]
    ai_remaining_count: int
    winner: Optional[str] = None
    ai_secret_id: Optional[int] = None


class HumanAnswerRequest(BaseModel):
    answer: str


class HumanQuestionRequest(BaseModel):
    question: str


class HumanGuessRequest(BaseModel):
    pokemon_id: int


class AiTurnResponse(BaseModel):
    action: str
    question: Optional[str] = None
    guess_id: Optional[int] = None
    guess_correct: Optional[bool] = None
    chat_history: List[dict]


class HumanAnswerResponse(BaseModel):
    eliminations: List[int]
    ai_remaining_count: int
    chat_history: List[dict]


class HumanQuestionResponse(BaseModel):
    answer: str
    chat_history: List[dict]


class HumanGuessResponse(BaseModel):
    correct: bool
    ai_secret_id: int
    chat_history: List[dict]
