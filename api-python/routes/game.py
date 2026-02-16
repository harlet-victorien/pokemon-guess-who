from fastapi import APIRouter, HTTPException

from models import (
    StartGameRequest,
    StartGameResponse,
    SetHumanSecretRequest,
    GameStateResponse,
)
from game_state import create_session, get_session

router = APIRouter(prefix="/game", tags=["game"])


@router.post("/start", response_model=StartGameResponse)
def start_game(req: StartGameRequest):
    session = create_session(req.player_name, req.seed, req.pokemon_list)
    return StartGameResponse(session_id=session.session_id, ai_name=session.ai_name)


@router.post("/{session_id}/set-human-secret")
def set_human_secret(session_id: str, req: SetHumanSecretRequest):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    valid_ids = {p.id for p in session.pokemon_list}
    if req.pokemon_id not in valid_ids:
        raise HTTPException(400, "Invalid pokemon ID")

    session.human_secret_id = req.pokemon_id
    session.phase = "ai_turn"
    return {"success": True}


@router.get("/{session_id}/state", response_model=GameStateResponse)
def get_state(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    return GameStateResponse(
        phase=session.phase,
        ai_name=session.ai_name,
        turn_number=session.turn_number,
        chat_history=session.get_chat_dicts(),
        ai_remaining_count=len(session.ai_candidates),
        winner=session.winner,
        ai_secret_id=session.ai_secret_id if session.phase == "game_over" else None,
    )
