"""Main AI agent orchestrator — handles AI turns."""

from langchain_mistralai import ChatMistralAI
from langchain_core.messages import HumanMessage, SystemMessage

from game_state import GameSession, ChatMessage, GUESS_THRESHOLD
from agent.prompts import ORCHESTRATOR_ASK, ORCHESTRATOR_GUESS
from agent.tools import ask_question, guess_pokemon
from agent.subagent import get_eliminations


def _get_llm(temperature: float = 0.3) -> ChatMistralAI:
    return ChatMistralAI(model="mistral-large-latest", temperature=temperature)


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


def ai_decide_and_act(session: GameSession) -> dict:
    """AI turn: decide to guess or ask based on candidate count.

    Returns:
        {"action": "question", "question": "..."} or
        {"action": "guess", "guess_id": X, "guess_correct": bool}
    """
    candidate_count = len(session.ai_candidates)

    if candidate_count <= GUESS_THRESHOLD:
        return _ai_guess(session)
    else:
        return _ai_ask(session)


def _ai_ask(session: GameSession) -> dict:
    """AI asks a yes/no question."""
    llm = _get_llm(temperature=0.7)
    llm_with_tools = llm.bind_tools([ask_question])

    prompt = ORCHESTRATOR_ASK.format(
        candidate_count=len(session.ai_candidates),
        candidates_list=_format_candidates_list(session),
        qa_history=_build_qa_history(session),
        asked_questions=_get_asked_questions(session),
    )

    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content="It's your turn. Ask a strategic yes/no question."),
    ]

    response = llm_with_tools.invoke(messages)

    # Extract question from tool call
    if response.tool_calls:
        for tc in response.tool_calls:
            if tc["name"] == "ask_question":
                question = tc["args"]["question"]
                session.pending_ai_question = question
                session.chat_history.append(ChatMessage(role="ai_question", content=question))
                return {"action": "question", "question": question}

    # Fallback: extract from content
    content = response.content if isinstance(response.content, str) else str(response.content)
    if "?" in content:
        question = content.strip()
        session.pending_ai_question = question
        session.chat_history.append(ChatMessage(role="ai_question", content=question))
        return {"action": "question", "question": question}

    # Last resort
    question = "Is your Pokemon a Water type?"
    session.pending_ai_question = question
    session.chat_history.append(ChatMessage(role="ai_question", content=question))
    return {"action": "question", "question": question}


def _ai_guess(session: GameSession) -> dict:
    """AI guesses from remaining candidates."""
    llm = _get_llm()
    llm_with_tools = llm.bind_tools([guess_pokemon])

    prompt = ORCHESTRATOR_GUESS.format(
        candidate_count=len(session.ai_candidates),
        candidates_list=_format_candidates_list(session),
        qa_history=_build_qa_history(session),
    )

    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content="Make your guess!"),
    ]

    response = llm_with_tools.invoke(messages)

    guess_id = None
    if response.tool_calls:
        for tc in response.tool_calls:
            if tc["name"] == "guess_pokemon":
                guess_id = tc["args"]["pokemon_id"]

    # Fallback: pick first candidate
    if guess_id is None:
        guess_id = next(iter(session.ai_candidates))

    correct = guess_id == session.human_secret_id

    if correct:
        session.winner = session.ai_name
        session.phase = "game_over"
        session.chat_history.append(
            ChatMessage(role="system", content=f"{session.ai_name} guessed #{guess_id} — correct!")
        )
    else:
        session.winner = session.player_name
        session.phase = "game_over"
        session.chat_history.append(
            ChatMessage(role="system", content=f"{session.ai_name} guessed #{guess_id} — wrong! The secret was #{session.human_secret_id}.")
        )

    return {"action": "guess", "guess_id": guess_id, "guess_correct": correct}


def ai_process_answer(session: GameSession, answer: str) -> dict:
    """Process human answer: subagent checks candidates, AI eliminates, turn ends."""
    question = session.pending_ai_question or "Unknown question"
    session.pending_ai_question = None
    session.chat_history.append(ChatMessage(role="human_answer", content=answer))

    # Subagent checks each candidate against the question
    to_eliminate = get_eliminations(session, question, answer)

    eliminations: list[int] = []
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
