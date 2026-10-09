from typing import Annotated, Optional
import typer
from rich import print

from labhacker.client import APIClient
from labhacker.config import load_config, save_config

auth_app = typer.Typer(help="Gestion de la session et de l'authentification.")


@auth_app.command("login")
def login(
    email: Annotated[str, typer.Option(prompt="Adresse e-mail", help="Adresse e-mail du compte")],
    password: Annotated[str, typer.Option(prompt="Mot de passe", hide_input=True, help="Mot de passe")],
    username: Annotated[Optional[str], typer.Option(help="Pseudonyme pour la personnalisation locale")] = None,
):
    """S'authentifier auprès de Better-Auth via e-mail et enregistrer le jeton de session."""
    client = APIClient()

    if not username:
        username = email.split("@")[0]

    payload = {
        "email": email,
        "password": password,
    }

    # Route officielle Better-Auth
    response = client.post("/auth/sign-in/email", json_data=payload)

    # Récupération du jeton depuis l'en-tête HTTP set-auth-token
    token = response.headers.get("set-auth-token")

    # Fallback au cas où le serveur le transmettrait aussi dans le body
    if not token and response.text:
        try:
            data = response.json()
            token = data.get("token") or data.get("access_token")
        except Exception:
            token = None

    if not token:
        print("[bold red][ERREUR][/bold red] Échec de récupération du jeton : en-tête 'set-auth-token' absent.")
        raise typer.Exit(code=1)

    # Sauvegarde locale
    cfg = load_config()
    cfg["token"] = token
    cfg["email"] = email
    cfg["username"] = username
    save_config(cfg)

    print(f"[bold green][SUCCÈS][/bold green] Bienvenue, [bold cyan]@{username}[/bold cyan] ({email}) !")


@auth_app.command("logout")
def logout():
    """Déconnecter la session locale en effaçant les identifiants enregistrés."""
    cfg = load_config()
    if not cfg.get("token"):
        print("[yellow]Aucune session active à déconnecter.[/yellow]")
        return

    username = cfg.get("username", "utilisateur")
    cfg["token"] = None
    cfg["email"] = None
    cfg["username"] = None
    save_config(cfg)
    print(f"[bold green][SUCCÈS][/bold green] Déconnexion réussie. Au revoir [bold cyan]@{username}[/bold cyan] !")


@auth_app.command("whoami")
def whoami():
    """Afficher les informations de l'utilisateur actuellement connecté."""
    cfg = load_config()
    token = cfg.get("token")
    if not token:
        print("[yellow]Aucun utilisateur connecté. Lancez 'labhacker login'.[/yellow]")
        return

    username = cfg.get("username", "Inconnu")
    email = cfg.get("email", "Non renseigné")
    print(f"Connecté en tant que : [bold cyan]@{username}[/bold cyan] ([green]{email}[/green])")


@auth_app.command("set-url")
def set_url(
    url: Annotated[str, typer.Argument(help="URL de l'API (ex: http://localhost:3040)")],
):
    """Modifier l'adresse de base de l'API."""
    cfg = load_config()
    cfg["api_url"] = url.rstrip("/")
    save_config(cfg)
    print(f"[bold green][SUCCÈS][/bold green] URL cible mise à jour : [cyan]{cfg['api_url']}[/cyan]")