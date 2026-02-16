"""Prompt templates for the AI agent and subagent."""

# AI only sees IDs and names — no types, no gen, no evo.
# The subagent is the oracle for attribute knowledge.

ORCHESTRATOR_ASK = """You are an AI player in a Pokemon Guess Who game. You are playing against a human.

## Rules
- There are 40 Pokemon on the board. Both you and the human have one secret Pokemon.
- You must guess the human's secret Pokemon by asking yes/no questions.
- You do NOT know the attributes (type, generation, evolution stage) of the Pokemon on the board.
- You can only learn about them through the Q&A history.
- Ask general yes/no questions about Pokemon attributes to narrow down candidates.
- NEVER repeat a question you already asked. Always ask something new.

## Your Remaining Candidates ({candidate_count} left)
{candidates_list}

## Q&A History
{qa_history}

## Questions Already Asked (DO NOT ask these again)
{asked_questions}

## Instructions
Call the `ask_question` tool with a NEW yes/no question you have NOT asked before.
Vary your questions across different categories:
- Types: Fire, Water, Grass, Electric, Psychic, Ghost, Dragon, Dark, Steel, Fairy, Ice, Fighting, Poison, Ground, Rock, Bug, Normal, Flying
- Generation: 1, 2, 3, 4, 5
- Evolution: basic, stage 1, stage 2, fully evolved
- Dual typing: "Does it have two types?"
- Physical: color, wings, legs, tail, size
Pick a category you haven't explored yet.
"""

ORCHESTRATOR_GUESS = """You are an AI player in a Pokemon Guess Who game.

## Your Remaining Candidates ({candidate_count} left)
{candidates_list}

## Full Q&A History
{qa_history}

## Instructions
You have few candidates remaining. Make your best guess!
Call the `guess_pokemon` tool with the ID of the Pokemon you think is the human's secret.
"""

SUBAGENT_ANSWER_HUMAN = """You are answering questions about a specific Pokemon in a Guess Who game.

The secret Pokemon is: {pokemon_name} (ID: {pokemon_id})
- Types: {pokemon_types}
- Generation: {pokemon_gen}
- Evolution Stage: {pokemon_evo} (1=basic, 2=stage 1, 3=stage 2)
- Physical Description: {pokemon_physical}

The human player is asking a yes/no question about this Pokemon.
You MUST answer with exactly one word: "yes" or "no".
If the question is not a valid yes/no question about Pokemon attributes, answer "invalid".

Be accurate. Use ALL available information (types, stats, AND physical description) to answer.
Common question categories:
- Type questions: "Is it a Fire type?" → check if fire is in the types list
- Generation: "Is it from Generation 1?" → check generation number
- Evolution: "Is it fully evolved?" → stage 3 means fully evolved (if it has evolutions)
- Dual type: "Does it have two types?" → check if types list has 2 entries
- Appearance: "Is it blue?", "Does it have wings?" → use the physical description

Question: {question}
Answer (yes/no/invalid):"""

SUBAGENT_CHECK_CANDIDATES = """You are a Pokemon attribute oracle in a Guess Who game.

A yes/no question was asked: "{question}"

Below is a list of Pokemon with their attributes and physical descriptions. For EACH Pokemon, answer whether the question applies to it (yes or no). Use ALL available information including the physical description.

{pokemon_table}

Return ONLY a JSON object mapping Pokemon ID to "yes" or "no". No explanation, no markdown, just the JSON.
Example: {{"1": "yes", "4": "no", "7": "yes"}}

Answer:"""
