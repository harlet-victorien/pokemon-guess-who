"""Subagent — the attribute oracle.

Two roles:
1. Answer human questions about the AI's secret Pokemon.
2. Check all candidates against the AI's question to determine eliminations.

Uses physical descriptions from Kaggle dataset for appearance-based questions.
"""

import json
from typing import Dict, List

from langchain_mistralai import ChatMistralAI
from langchain_core.messages import HumanMessage

from game_state import GameSession
from models import PokemonData
from pokemon_data import get_pokemon_by_id
from physical_descriptions import get_description
from agent.prompts import SUBAGENT_ANSWER_HUMAN, SUBAGENT_CHECK_CANDIDATES


def _get_llm() -> ChatMistralAI:
    return ChatMistralAI(model="mistral-large-latest", temperature=0.0)


def answer_human_question(session: GameSession, question: str) -> str:
    """Answer a human's yes/no question about the AI's secret Pokemon."""
    ai_secret = get_pokemon_by_id(session.pokemon_list, session.ai_secret_id)
    if not ai_secret:
        return "invalid"

    llm = _get_llm()
    physical = get_description(ai_secret.name)

    prompt = SUBAGENT_ANSWER_HUMAN.format(
        pokemon_name=ai_secret.name,
        pokemon_id=ai_secret.id,
        pokemon_types=", ".join(ai_secret.types),
        pokemon_gen=ai_secret.generation,
        pokemon_evo=ai_secret.evolution_stage,
        pokemon_physical=physical or "No description available",
        question=question,
    )

    response = llm.invoke([HumanMessage(content=prompt)])
    content = response.content.strip().lower() if isinstance(response.content, str) else ""

    if "yes" in content:
        return "yes"
    elif "no" in content:
        return "no"
    return "invalid"


def _format_pokemon_table(candidates: List[PokemonData]) -> str:
    """Format candidates with full attributes + physical description for the subagent oracle."""
    lines = []
    for p in candidates:
        types_str = ", ".join(p.types)
        physical = get_description(p.name)
        desc_part = " | Description: {}".format(physical) if physical else ""
        lines.append(
            "- #{} {} | Types: {} | Gen: {} | Evo Stage: {}{}".format(
                p.id, p.name, types_str, p.generation, p.evolution_stage, desc_part
            )
        )
    return "\n".join(lines)


def check_candidates(session: GameSession, question: str) -> Dict[int, str]:
    """Check which candidates match the question. Returns {id: "yes"/"no"}.

    The subagent sees full attributes + physical descriptions and classifies each one.
    """
    candidates = [p for p in session.pokemon_list if p.id in session.ai_candidates]
    if not candidates:
        return {}

    llm = _get_llm()

    prompt = SUBAGENT_CHECK_CANDIDATES.format(
        question=question,
        pokemon_table=_format_pokemon_table(candidates),
    )

    response = llm.invoke([HumanMessage(content=prompt)])
    content = response.content.strip() if isinstance(response.content, str) else ""

    # Strip markdown fences if present
    if content.startswith("```"):
        content = content.split("\n", 1)[-1]
    if content.endswith("```"):
        content = content.rsplit("```", 1)[0]
    content = content.strip()

    try:
        raw = json.loads(content)
        return {int(k): v.lower().strip() for k, v in raw.items()}
    except (json.JSONDecodeError, ValueError, AttributeError):
        return {}


def get_eliminations(session: GameSession, question: str, human_answer: str) -> List[int]:
    """Determine which candidates to eliminate based on the question and answer.

    Logic:
    - Human answered "yes" → eliminate candidates where subagent says "no"
    - Human answered "no"  → eliminate candidates where subagent says "yes"
    """
    verdicts = check_candidates(session, question)

    to_eliminate = []  # type: List[int]
    for pid, verdict in verdicts.items():
        if pid not in session.ai_candidates:
            continue
        if human_answer == "yes" and verdict == "no":
            to_eliminate.append(pid)
        elif human_answer == "no" and verdict == "yes":
            to_eliminate.append(pid)

    return to_eliminate
