"""Agentic architecture configuration — single source of truth.

Declares all agents, their models, temperatures, and tool schemas.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any


@dataclass
class ToolParam:
    name: str
    type: str
    description: str


@dataclass
class ToolDef:
    name: str
    description: str
    params: List[ToolParam] = field(default_factory=list)


@dataclass
class AgentDef:
    name: str
    role: str
    model: str
    temperature: float
    tools: List[ToolDef] = field(default_factory=list)
    data_flow: str = ""


# ---------------------------------------------------------------------------
# Tool schemas
# ---------------------------------------------------------------------------

TOOL_ASK_QUESTION = ToolDef(
    name="ask_question",
    description="Ask a yes/no question about the human's secret Pokemon.",
    params=[ToolParam("question", "str", "A yes/no question about the human's secret Pokemon.")],
)

TOOL_GUESS_POKEMON = ToolDef(
    name="guess_pokemon",
    description="Guess the human's secret Pokemon by ID. Wrong guess = you lose.",
    params=[ToolParam("pokemon_id", "int", "The ID of the Pokemon you think is the human's secret.")],
)

TOOL_ANSWER_YES_NO = ToolDef(
    name="answer_yes_no",
    description="Answer a yes/no question about the AI's secret Pokemon.",
    params=[ToolParam("answer", "str", "Must be exactly 'yes' or 'no'.")],
)

TOOL_EVALUATE_CANDIDATES = ToolDef(
    name="evaluate_candidates",
    description="Evaluate all candidates against a question, returning verdicts.",
    params=[ToolParam("verdicts", "str", "JSON string mapping Pokemon ID to 'yes' or 'no'.")],
)

# ---------------------------------------------------------------------------
# Agent definitions
# ---------------------------------------------------------------------------

# Format: "provider:model" — passed to init_chat_model()
# Change this string to switch providers. No other file changes needed.
# Providers:
#   "google_genai:gemini-2.0-flash"         → GOOGLE_API_KEY
#   "anthropic:claude-haiku-4-5-20251001"   → ANTHROPIC_API_KEY
#   "openai:gpt-4o"                         → OPENAI_API_KEY
#   "mistral:mistral-large-latest"          → MISTRAL_API_KEY
MODEL = "anthropic:claude-haiku-4-5"

ORCHESTRATOR_ASK_AGENT = AgentDef(
    name="orchestrator_ask",
    role="Decides which yes/no question to ask the human.",
    model=MODEL,
    temperature=0.7,
    tools=[TOOL_ASK_QUESTION],
    data_flow="Receives candidate list + QA history → calls ask_question tool.",
)

ORCHESTRATOR_GUESS_AGENT = AgentDef(
    name="orchestrator_guess",
    role="Guesses the human's secret Pokemon when few candidates remain.",
    model=MODEL,
    temperature=0.3,
    tools=[TOOL_GUESS_POKEMON],
    data_flow="Receives candidate list + QA history → calls guess_pokemon tool.",
)

SUBAGENT_ANSWER = AgentDef(
    name="subagent_answer",
    role="Answers human questions about the AI's secret Pokemon.",
    model=MODEL,
    temperature=0.0,
    tools=[TOOL_ANSWER_YES_NO],
    data_flow="Receives secret Pokemon data + question → calls answer_yes_no tool.",
)

SUBAGENT_EVALUATE = AgentDef(
    name="subagent_evaluate",
    role="Evaluates each candidate against a question for elimination.",
    model=MODEL,
    temperature=0.0,
    tools=[TOOL_EVALUATE_CANDIDATES],
    data_flow="Receives candidate table + question → calls evaluate_candidates tool.",
)
