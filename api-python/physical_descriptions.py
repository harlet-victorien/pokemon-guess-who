"""Load Pokemon physical descriptions from Kaggle dataset."""

import csv
from pathlib import Path
from typing import Optional, Dict

import kagglehub


_descriptions = None  # type: Optional[Dict[str, str]]


def _load() -> Dict[str, str]:
    """Download dataset and return {lowercase_name: description}."""
    global _descriptions
    if _descriptions is not None:
        return _descriptions

    path = kagglehub.dataset_download("caitlynjade/pokemon-physical-descriptions")
    dataset_dir = Path(path)

    csv_file = None
    for f in dataset_dir.rglob("*.csv"):
        csv_file = f
        break

    if csv_file is None:
        _descriptions = {}
        return _descriptions

    _descriptions = {}
    with open(csv_file, encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            name = row.get("name", "").strip().lower()
            desc = row.get("physical_description", "").strip()
            if name and desc:
                _descriptions[name] = desc

    return _descriptions


def get_description(pokemon_name: str) -> str:
    """Get physical description for a pokemon by name. Returns empty string if not found."""
    descs = _load()
    return descs.get(pokemon_name.strip().lower(), "")
