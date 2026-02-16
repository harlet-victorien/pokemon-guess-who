"""Port of lib/rng.ts — Linear Congruential Generator for seeded random numbers."""


def seeded_random(seed: int):
    state = seed

    def next_random():
        nonlocal state
        state = (state * 1103515245 + 12345) & 0x7FFFFFFF
        return state / 0x7FFFFFFF

    return next_random


def generate_pokemon_ids(seed: int, count: int = 40) -> list[int]:
    rng = seeded_random(seed)
    ids: list[int] = []
    seen: set[int] = set()

    min_id = 1
    max_id = 649

    while len(ids) < count:
        val = rng()
        pokemon_id = int(val * (max_id - min_id + 1)) + min_id
        if pokemon_id not in seen:
            seen.add(pokemon_id)
            ids.append(pokemon_id)

    return ids
