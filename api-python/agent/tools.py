"""LangChain tools for the AI agent — grouped by agent role."""

from langchain_core.tools import tool


# ---------------------------------------------------------------------------
# Orchestrator tools
# ---------------------------------------------------------------------------

@tool
def ask_question(question: str) -> str:
    """Ask a yes/no question about the human's secret Pokemon.
    The question should help narrow down which Pokemon the human has chosen.
    Good questions target type, generation, evolution stage, or physical traits.

    Args:
        question: A yes/no question about the human's secret Pokemon.
    """
    return question


@tool
def guess_pokemon(pokemon_id: int) -> str:
    """Guess the human's secret Pokemon by ID. Only use when you have few candidates left.
    If wrong, you lose the game!

    Args:
        pokemon_id: The ID of the Pokemon you think is the human's secret.
    """
    return f"Guessing Pokemon {pokemon_id}"


ORCHESTRATOR_TOOLS = [ask_question, guess_pokemon]


# ---------------------------------------------------------------------------
# Subagent tools
# ---------------------------------------------------------------------------

@tool
def answer_yes_no(answer: str) -> str:
    """Answer a yes/no question about the AI's secret Pokemon.

    Args:
        answer: Must be exactly "yes" or "no".
    """
    return answer


@tool
def evaluate_candidates(verdicts: str) -> str:
    """Evaluate all candidates against a question.
    Return a JSON string mapping each Pokemon ID to "yes" or "no".

    Args:
        verdicts: JSON string like {"1": "yes", "4": "no", "7": "yes"}.
    """
    return verdicts


SUBAGENT_ANSWER_TOOLS = [answer_yes_no]
SUBAGENT_EVALUATE_TOOLS = [evaluate_candidates]
