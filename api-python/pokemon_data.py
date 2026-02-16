"""Pokemon data helpers for attribute lookups used by the AI agent."""

from typing import Optional, List
from models import PokemonData


def get_pokemon_by_id(pokemon_list: List[PokemonData], pokemon_id: int) -> Optional[PokemonData]:
    for p in pokemon_list:
        if p.id == pokemon_id:
            return p
    return None
