import typer
from rich import print
from typing import Annotated

app = typer.Typer(
    name="labhacker",
    help="CLI pour gérer les environnements de la plateforme Lab Hacker.",
    no_args_is_help=True
)

@app.command()
def login(
    username: Annotated[str, typer.Option(prompt=True, help="Nom d'utilisateur")]
):
    """S'authentifier auprès de la plateforme."""
    print(f"[bold green]Authentification demandée pour :[/bold green] {username}")

@app.command()
def list():
    """Lister tous les labs de l'utilisateur."""
    print("[cyan]Récupération de la liste des labs...[/cyan]")

@app.command()
def create(
    lab_type: Annotated[str, typer.Argument(help="Type de lab (ex: web-pentest-basic)")],
    wait: Annotated[bool, typer.Option("--wait", "-w", help="Attendre que le worker termine le provisioning")] = False
):
    """Demander la création d'un lab."""
    print(f"[bold yellow]Demande de lab :[/bold yellow] {lab_type} (attente active : {wait})")

@app.command()
def status(
    lab_id: Annotated[str, typer.Argument(help="Identifiant unique du lab")]
):
    """Consulter l'état et les informations de connexion d'un lab."""
    print(f"[magenta]Vérification du statut pour le lab ID :[/magenta] {lab_id}")

@app.command()
def delete(
    lab_id: Annotated[str, typer.Argument(help="Identifiant unique du lab à détruire")],
    force: Annotated[bool, typer.Option("--yes", "-y", help="Confirmer sans demander")] = False
):
    """Détruire un lab actif."""
    print(f"[bold red]Destruction demandée pour le lab ID :[/bold red] {lab_id} (force : {force})")

if __name__ == "__main__":
    app()