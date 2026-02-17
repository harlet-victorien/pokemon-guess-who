"""Main AI agent orchestrator — handles AI turns via LangChain tool calling."""

import logging
from typing import Optional

from langchain.chat_models import init_chat_model

from agent.config import ORCHESTRATOR_ASK_AGENT, ORCHESTRATOR_GUESS_AGENT
from agent.tools import ask_question, guess_pokemon
from game_state import GameSession, ChatMessage, GUESS_THRESHOLD
from agent.prompts import ORCHESTRATOR_ASK, ORCHESTRATOR_GUESS
from agent.subagent import get_eliminations

logger = logging.getLogger(__name__)


def _get_llm(agent_def=ORCHESTRATOR_ASK_AGENT):
    return init_chat_model(
        agent_def.model,
        temperature=agent_def.temperature,
    )


def _get_asked_questions(session: GameSession) -> str:
    questions = [msg.content for msg in session.chat_history if msg.role == "ai_question"]
    if not questions:
        return "(None yet)"
    return "\n".join("- {}".format(q) for q in questions)


def _build_qa_history(session: GameSession) -> str:
    if not session.chat_history:
        return "(No questions asked yet)"
    lines = []
    for msg in session.chat_history:
        if msg.role == "ai_question":
            lines.append(f"AI asked: {msg.content}")
        elif msg.role == "human_answer":
            lines.append(f"Human answered: {msg.content}")
        elif msg.role == "human_question":
            lines.append(f"Human asked: {msg.content}")
        elif msg.role == "ai_answer":
            lines.append(f"AI answered: {msg.content}")
        elif msg.role == "system":
            lines.append(f"[{msg.content}]")
    return "\n".join(lines)


def _format_candidates_list(session: GameSession) -> str:
    candidates = session.get_candidate_names()
    return "\n".join(f"- #{c['id']} {c['name']}" for c in candidates)


# Fallback questions pool — used when LLM/tool calling fails entirely.
_FALLBACK_QUESTIONS = [
    "Is your Pokemon a Fire type?",
    "Is your Pokemon from Generation 1?",
    "Does your Pokemon have two types?",
    "Is your Pokemon fully evolved?",
    "Is your Pokemon a Grass type?",
    "Is your Pokemon a Psychic type?",
    "Is your Pokemon from Generation 3?",
    "Does your Pokemon have wings?",
    "Is your Pokemon a Water type?",
    "Is your Pokemon an Electric type?",
]


def _get_fallback_question(session: GameSession) -> str:
    """Pick a fallback question that hasn't been asked yet."""
    asked = {msg.content for msg in session.chat_history if msg.role == "ai_question"}
    for q in _FALLBACK_QUESTIONS:
        if q not in asked:
            return q
    return "Is your Pokemon a Normal type?"


def ai_decide_and_act(session: GameSession) -> dict:
    """AI turn: decide to guess or ask based on candidate count."""
    candidate_count = len(session.ai_candidates)
    logger.info("[AI Turn] candidates=%d, threshold=%d, action=%s",
                candidate_count, GUESS_THRESHOLD,
                "guess" if candidate_count <= GUESS_THRESHOLD else "ask")

    if candidate_count <= GUESS_THRESHOLD:
        return _ai_guess(session)
    else:
        return _ai_ask(session)


def _ai_ask(session: GameSession) -> dict:
    """AI asks a yes/no question via LangChain tool calling."""
    llm = _get_llm(ORCHESTRATOR_ASK_AGENT)
    llm_with_tools = llm.bind_tools([ask_question])

    messages = ORCHESTRATOR_ASK.invoke({
        "candidate_count": len(session.ai_candidates),
        "candidates_list": _format_candidates_list(session),
        "qa_history": _build_qa_history(session),
        "asked_questions": _get_asked_questions(session),
    })

    question = None
    try:
        response = llm_with_tools.invoke(messages)
        logger.info("[AI Ask] tool_calls=%s, content=%s",
                    response.tool_calls, response.content)

        if response.tool_calls:
            for tc in response.tool_calls:
                if tc["name"] == "ask_question":
                    question = tc["args"].get("question")
                    break

        # Fallback: try to extract from plain text content
        if not question and isinstance(response.content, str) and response.content.strip():
            text = response.content.strip()
            if text.endswith("?"):
                question = text

    except Exception as e:
        logger.error("[AI Ask] LLM invoke failed: %s", e)

    if not question:
        question = _get_fallback_question(session)
        logger.warning("[AI Ask] Tool call failed, using fallback: %s", question)
    else:
        logger.info("[AI Ask] Got question via tool call: %s", question)

    session.pending_ai_question = question
    session.chat_history.append(ChatMessage(role="ai_question", content=question))
    return {"action": "question", "question": question}


def _ai_guess(session: GameSession) -> dict:
    """AI guesses via LangChain tool calling."""
    llm = _get_llm(ORCHESTRATOR_GUESS_AGENT)
    llm_with_tools = llm.bind_tools([guess_pokemon])

    messages = ORCHESTRATOR_GUESS.invoke({
        "candidate_count": len(session.ai_candidates),
        "candidates_list": _format_candidates_list(session),
        "qa_history": _build_qa_history(session),
    })

    guess_id = None
    try:
        response = llm_with_tools.invoke(messages)
        logger.info("[AI Guess] tool_calls=%s, content=%s",
                    response.tool_calls, response.content)

        if response.tool_calls:
            for tc in response.tool_calls:
                if tc["name"] == "guess_pokemon":
                    raw_id = tc["args"].get("pokemon_id")
                    if raw_id is not None:
                        pid = int(raw_id)
                        if pid in session.ai_candidates:
                            guess_id = pid
                    break

    except Exception as e:
        logger.error("[AI Guess] LLM invoke failed: %s", e)

    if guess_id is None:
        guess_id = next(iter(session.ai_candidates))
        logger.warning("[AI Guess] Tool call failed, falling back to first candidate: #%d", guess_id)
    else:
        logger.info("[AI Guess] Got guess via tool call: #%d", guess_id)

    correct = guess_id == session.human_secret_id
    logger.info("[AI Guess] id=%d, human_secret=%d, correct=%s",
                guess_id, session.human_secret_id, correct)

    if correct:
        session.winner = session.ai_name
        session.phase = "game_over"
        session.chat_history.append(
            ChatMessage(role="system", content=f"{session.ai_name} guessed #{guess_id} — correct!")
        )
    else:
        # Wrong guess: eliminate that candidate and switch to human turn
        session.ai_candidates.discard(guess_id)
        session.phase = "human_turn"
        session.chat_history.append(
            ChatMessage(role="system", content=f"{session.ai_name} guessed #{guess_id} — wrong! {len(session.ai_candidates)} candidates remaining.")
        )

    return {"action": "guess", "guess_id": guess_id, "guess_correct": correct}


def ai_process_answer(session: GameSession, answer: str) -> dict:
    """Process human answer: subagent checks candidates, AI eliminates, turn ends."""
    question = session.pending_ai_question or "Unknown question"
    session.pending_ai_question = None
    session.chat_history.append(ChatMessage(role="human_answer", content=answer))

    # Subagent checks each candidate against the question
    to_eliminate = get_eliminations(session, question, answer)

    eliminations = []  # type: list
    for pid in to_eliminate:
        if pid in session.ai_candidates:
            session.ai_candidates.discard(pid)
            eliminations.append(pid)

    # Turn ends — switch to human turn
    session.phase = "human_turn"

    if eliminations:
        session.chat_history.append(
            ChatMessage(role="system", content=f"{session.ai_name} eliminated {len(eliminations)} Pokemon. {len(session.ai_candidates)} candidates remaining.")
        )
    else:
        session.chat_history.append(
            ChatMessage(role="system", content=f"{session.ai_name} couldn't eliminate any Pokemon this turn.")
        )

    return {
        "eliminations": eliminations,
        "ai_remaining_count": len(session.ai_candidates),
    }
