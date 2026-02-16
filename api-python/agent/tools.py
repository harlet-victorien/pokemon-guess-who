"""LangChain tools for the AI agent."""

from langchain_core.tools import tool


@tool
def ask_question(question: str) -> str:
    """Ask a yes/no question about the human's secret Pokemon.
    The question should help narrow down which Pokemon the human has chosen.
    Good questions target type, generation, evolution stage, or number of types.

    Args:
        question: A yes/no question about the human's secret Pokemon.
    """
    return question


@tool
def guess_pokemon(pokemon_id: int) -> str:
    """Guess the human's secret Pokemon. Only use when you have few candidates left.
    If wrong, you lose the game!

    Args:
        pokemon_id: The ID of the Pokemon you think is the human's secret.
    """
    return f"Guessing Pokemon {pokemon_id}"
