from typing import Annotated
import typer
from rich import print

from labhacker.client import APIClient
from labhacker.config import delete_config, load_config, save_config

auth_app = typer.Typer(help="Gestion de la session et de l'authentification.")


@auth_app.command("login")
def login(
    username: Annotated[str, typer.Option(prompt="Nom d'utilisateur", help="Identifiant du compte")],
    password: Annotated[str, typer.Option(prompt="Mot de passe", hide_input=True, help="Mot de passe")],
):
    """S'authentifier auprès de la plateforme et enregistrer le jeton d'accès."""
    client = APIClient()

    payload = {
        "username": username,
        "password": password,
    }

    # Appel vers le endpoint d'authentification exposé par le proxy
    response = client.post("/auth/token", json_data=payload)
    data = response.json()

    token = data.get("access_token")
    if not token:
        print("[bold red][ERREUR][/bold red] La réponse du serveur ne contient pas de jeton d'accès.")
        raise typer.Exit(code=1)

    # Sauvegarde dans ~/.labhacker/config.json
    cfg = load_config()
    cfg["token"] = token
    save_config(cfg)

    print(f"[bold green][SUCCÈS][/bold green] Connecté en tant que [bold cyan]{username}[/bold cyan].")


@auth_app.command("logout")
def logout():
    """Déconnecter la session locale en supprimant le jeton."""
    cfg = load_config()
    if not cfg.get("token"):
        print("[yellow]Aucune session active à déconnecter.[/yellow]")
        return

    # Supprime la clé token et persiste
    cfg["token"] = None
    save_config(cfg)
    print("[bold green][SUCCÈS][/bold green] Session déconnectée.")


@auth_app.command("set-url")
def set_url(
    url: Annotated[str, typer.Argument(help="URL publique du reverse proxy (ex: http://localhost/api)")],
):
    """Modifier l'adresse du reverse proxy cible."""
    cfg = load_config()
    cfg["api_url"] = url.rstrip("/")
    save_config(cfg)
    print(f"[bold green][SUCCÈS][/bold green] URL du proxy mise à jour : [cyan]{cfg['api_url']}[/cyan]")