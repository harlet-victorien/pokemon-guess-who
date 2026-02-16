from fastapi import APIRouter, HTTPException

from models import (
    HumanAnswerRequest,
    AiTurnResponse,
    HumanAnswerResponse,
)
from game_state import get_session
from agent.orchestrator import ai_decide_and_act, ai_process_answer

router = APIRouter(prefix="/game", tags=["turn"])


@router.post("/{session_id}/ai-turn", response_model=AiTurnResponse)
def ai_turn(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session.phase != "ai_turn":
        raise HTTPException(400, f"Not AI's turn (phase: {session.phase})")

    # Increment turn at start of AI turn
    session.increment_turn()

    result = ai_decide_and_act(session)

    return AiTurnResponse(
        action=result["action"],
        question=result.get("question"),
        guess_id=result.get("guess_id"),
        guess_correct=result.get("guess_correct"),
        chat_history=session.get_chat_dicts(),
    )


@router.post("/{session_id}/human-answer", response_model=HumanAnswerResponse)
def human_answer(session_id: str, req: HumanAnswerRequest):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session.phase != "ai_turn":
        raise HTTPException(400, f"Not AI's turn (phase: {session.phase})")
    if not session.pending_ai_question:
        raise HTTPException(400, "No pending question")

    result = ai_process_answer(session, req.answer)

    return HumanAnswerResponse(
        eliminations=result["eliminations"],
        ai_remaining_count=result["ai_remaining_count"],
        chat_history=session.get_chat_dicts(),
    )
