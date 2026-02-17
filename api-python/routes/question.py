from fastapi import APIRouter, HTTPException

from models import (
    HumanQuestionRequest,
    HumanQuestionResponse,
    HumanGuessRequest,
    HumanGuessResponse,
)
from game_state import get_session, ChatMessage
from agent.subagent import answer_human_question

router = APIRouter(prefix="/game", tags=["question"])


@router.post("/{session_id}/human-question", response_model=HumanQuestionResponse)
def human_question(session_id: str, req: HumanQuestionRequest):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session.phase != "human_turn":
        raise HTTPException(400, f"Not human's turn (phase: {session.phase})")

    session.chat_history.append(ChatMessage(role="human_question", content=req.question))

    answer = answer_human_question(session, req.question)

    session.chat_history.append(ChatMessage(role="ai_answer", content=answer))

    # Stay on human_turn — human can ask more or guess
    return HumanQuestionResponse(answer=answer, chat_history=session.get_chat_dicts())


@router.post("/{session_id}/human-guess", response_model=HumanGuessResponse)
def human_guess(session_id: str, req: HumanGuessRequest):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session.phase != "human_turn":
        raise HTTPException(400, f"Not human's turn (phase: {session.phase})")

    correct = req.pokemon_id == session.ai_secret_id

    if correct:
        session.winner = session.player_name
        session.phase = "game_over"
        session.chat_history.append(
            ChatMessage(role="system", content=f"{session.player_name} guessed correctly! It was Pokemon #{session.ai_secret_id}!")
        )
    else:
        # Wrong guess: stay on human_turn, just log it
        session.chat_history.append(
            ChatMessage(role="system", content=f"{session.player_name} guessed #{req.pokemon_id} — wrong!")
        )

    return HumanGuessResponse(
        correct=correct,
        ai_secret_id=session.ai_secret_id if correct else None,
        chat_history=session.get_chat_dicts(),
    )


@router.post("/{session_id}/end-turn")
def end_turn(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session.phase != "human_turn":
        raise HTTPException(400, f"Not human's turn (phase: {session.phase})")

    session.phase = "ai_turn"
    return {"success": True, "phase": "ai_turn"}
