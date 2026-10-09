import json
import os
from pathlib import Path
from typing import Any, Dict

# Emplacement standard sous Linux : ~/.labhacker/config.json
CONFIG_DIR = Path.home() / ".labhacker"
CONFIG_FILE = CONFIG_DIR / "config.json"

DEFAULT_API_URL = "http://localhost/api"


def load_config() -> Dict[str, Any]:
    """Charge la configuration depuis le fichier JSON s'il existe."""
    if not CONFIG_FILE.exists():
        return {"api_url": DEFAULT_API_URL, "token": None}
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {"api_url": DEFAULT_API_URL, "token": None}


def save_config(data: Dict[str, Any]) -> None:
    """Sauvegarde le dictionnaire de configuration dans ~/.labhacker/config.json."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def delete_config() -> bool:
    """Supprime le fichier de configuration (utilisé pour logout)."""
    if CONFIG_FILE.exists():
        CONFIG_FILE.unlink()
        return True
    return False


def get_api_url() -> str:
    """Retourne l'URL du proxy : priorité à la variable d'environnement."""
    env_url = os.getenv("LABHACKER_API_URL")
    if env_url:
        return env_url.rstrip("/")
    cfg = load_config()
    return cfg.get("api_url", DEFAULT_API_URL).rstrip("/")


def get_token() -> str | None:
    """Retourne le token JWT : priorité à la variable d'environnement."""
    env_token = os.getenv("LABHACKER_TOKEN")
    if env_token:
        return env_token
    cfg = load_config()
    return cfg.get("token")