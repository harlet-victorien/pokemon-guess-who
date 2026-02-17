"""Subagent — the attribute oracle via LangChain tool calling.

Two roles:
1. Answer human questions about the AI's secret Pokemon.
2. Check all candidates against the AI's question to determine eliminations.

Uses physical descriptions from Kaggle dataset for appearance-based questions.
"""

import json
import logging
from typing import Dict, List

from langchain.chat_models import init_chat_model

from agent.config import SUBAGENT_ANSWER, SUBAGENT_EVALUATE
from agent.tools import SUBAGENT_ANSWER_TOOLS, SUBAGENT_EVALUATE_TOOLS
from game_state import GameSession
from models import PokemonData
from pokemon_data import get_pokemon_by_id
from physical_descriptions import get_description
from agent.prompts import SUBAGENT_ANSWER_HUMAN, SUBAGENT_CHECK_CANDIDATES

logger = logging.getLogger(__name__)


def _get_llm(agent_def=SUBAGENT_ANSWER):
    return init_chat_model(
        agent_def.model,
        temperature=agent_def.temperature,
    )


def answer_human_question(session: GameSession, question: str) -> str:
    """Answer a human's yes/no question about the AI's secret Pokemon."""
    ai_secret = get_pokemon_by_id(session.pokemon_list, session.ai_secret_id)
    if not ai_secret:
        return "invalid"

    llm = _get_llm()
    llm_with_tools = llm.bind_tools(SUBAGENT_ANSWER_TOOLS)
    physical = get_description(ai_secret.name)

    messages = SUBAGENT_ANSWER_HUMAN.invoke({
        "pokemon_name": ai_secret.name,
        "pokemon_id": ai_secret.id,
        "pokemon_types": ", ".join(ai_secret.types),
        "pokemon_gen": ai_secret.generation,
        "pokemon_evo": ai_secret.evolution_stage,
        "pokemon_physical": physical or "No description available",
        "question": question,
    })

    try:
        response = llm_with_tools.invoke(messages)
        logger.info("[Subagent Answer] secret=%s (#%d), question='%s', tool_calls=%s, content=%s",
                    ai_secret.name, ai_secret.id, question, response.tool_calls, response.content)

        if response.tool_calls:
            for tc in response.tool_calls:
                if tc["name"] == "answer_yes_no":
                    raw = tc["args"].get("answer", "").strip().lower()
                    if raw in ("yes", "no"):
                        return raw

        # Fallback: parse plain text
        content = response.content.strip().lower() if isinstance(response.content, str) else ""
        if "yes" in content:
            return "yes"

    except Exception as e:
        logger.error("[Subagent Answer] LLM invoke failed: %s", e)

    return "no"


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

    llm = _get_llm(SUBAGENT_EVALUATE)
    llm_with_tools = llm.bind_tools(SUBAGENT_EVALUATE_TOOLS)

    messages = SUBAGENT_CHECK_CANDIDATES.invoke({
        "question": question,
        "pokemon_table": _format_pokemon_table(candidates),
    })

    try:
        response = llm_with_tools.invoke(messages)
        logger.info("[Subagent Check] question='%s', tool_calls=%s",
                    question, response.tool_calls)

        content = None

        # Primary: extract from tool call
        if response.tool_calls:
            for tc in response.tool_calls:
                if tc["name"] == "evaluate_candidates":
                    content = tc["args"].get("verdicts", "")
                    break

        # Fallback: parse plain text
        if not content and isinstance(response.content, str) and response.content.strip():
            content = response.content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[-1]
            if content.endswith("```"):
                content = content.rsplit("```", 1)[0]
            content = content.strip()

        if content:
            raw = json.loads(content)
            verdicts = {int(k): v.lower().strip() for k, v in raw.items()}
            yes_count = sum(1 for v in verdicts.values() if v == "yes")
            no_count = sum(1 for v in verdicts.values() if v == "no")
            logger.info("[Subagent Check] question='%s', candidates=%d, yes=%d, no=%d",
                        question, len(candidates), yes_count, no_count)
            return verdicts

    except (json.JSONDecodeError, ValueError, AttributeError) as e:
        logger.error("[Subagent Check] Failed to parse: %s", e)
    except Exception as e:
        logger.error("[Subagent Check] LLM invoke failed: %s", e)

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

    logger.info("[Eliminations] question='%s', answer='%s', eliminating=%d, remaining=%d",
                question, human_answer, len(to_eliminate),
                len(session.ai_candidates) - len(to_eliminate))
    return to_eliminate
