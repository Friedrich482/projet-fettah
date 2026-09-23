import time
from typing import Annotated
import typer
from rich import print
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from labhacker.client import APIClient

labs_app = typer.Typer(help="Gestion et cycle de vie des labs de hacking.")
console = Console()

STATUS_COLORS = {
    "PENDING": "yellow",
    "RUNNING": "blue",
    "READY": "bold green",
    "FAILED": "bold red",
    "DESTROYED": "dim red",
}


@labs_app.command("list")
def list_labs():
    """Lister tous vos environnements de lab."""
    client = APIClient()
    response = client.get("/labs")
    labs = response.json()

    if not labs:
        print("[yellow]Aucun lab actif trouvé.[/yellow]")
        return

    table = Table(title="Vos Environnements Lab Hacker", header_style="bold cyan")
    table.add_column("ID", justify="center", style="dim")
    table.add_column("Type de Lab", style="magenta")
    table.add_column("Statut", justify="center")
    table.add_column("Accès / Connexion", style="white")

    for lab in labs:
        st = lab.get("statut", "UNKNOWN")
        color = STATUS_COLORS.get(st, "white")
        formatted_status = f"[{color}]{st}[/{color}]"
        conn = lab.get("infos_connexion") or "-"

        table.add_row(
            str(lab.get("id")),
            lab.get("lab_type", "-"),
            formatted_status,
            str(conn),
        )

    console.print(table)


@labs_app.command("status")
def get_status(
    lab_id: Annotated[str, typer.Argument(help="Identifiant du lab")],
):
    """Afficher les détails et informations de connexion d'un lab."""
    client = APIClient()
    response = client.get(f"/labs/{lab_id}")
    lab = response.json()

    st = lab.get("statut", "UNKNOWN")
    color = STATUS_COLORS.get(st, "white")
    conn = lab.get("infos_connexion") or "Non disponible"

    body = (
        f"[bold]Type :[/bold] {lab.get('lab_type', '-')}\n"
        f"[bold]Statut :[/bold] [{color}]{st}[/{color}]\n"
        f"[bold]Conteneur :[/bold] {lab.get('conteneur_id', 'En cours de création')}\n"
        f"[bold]Connexion :[/bold] [green]{conn}[/green]"
    )
    console.print(Panel(body, title=f"Lab #{lab_id}", expand=False))


@labs_app.command("delete")
def delete_lab(
    lab_id: Annotated[str, typer.Argument(help="Identifiant du lab à détruire")],
    force: Annotated[bool, typer.Option("--yes", "-y", help="Confirmer sans invite")] = False,
):
    """Détruire un conteneur de lab existant."""
    if not force:
        confirm = typer.confirm(f"Êtes-vous sûr de vouloir détruire le lab #{lab_id} ?")
        if not confirm:
            print("[yellow]Destruction annulée.[/yellow]")
            return

    client = APIClient()
    client.delete(f"/labs/{lab_id}")
    print(f"[bold green][SUCCÈS][/bold green] Ordre de destruction envoyé pour le lab #{lab_id}.")


@labs_app.command("create")
def create_lab(
    lab_type: Annotated[str, typer.Argument(help="Type de machine (ex: web-pentest-basic)")],
    wait: Annotated[bool, typer.Option("--wait", "-w", help="Attendre que le lab soit opérationnel")] = False,
):
    """Demander le déploiement d'un nouveau lab."""
    client = APIClient()
    payload = {"lab_type": lab_type}
    response = client.post("/labs", json_data=payload)
    data = response.json()

    lab_id = data.get("id")
    print(f"[bold green][CRÉÉ][/bold green] Demande enregistrée avec succès (ID: [bold cyan]#{lab_id}[/bold cyan]).")

    if not wait:
        print("[yellow]Le lab est en file d'attente (PENDING). Utilisez 'labhacker status' pour suivre l'état.[/yellow]")
        return

    # Gestion de l'attente active avec Rich Status (Spinner)
    with console.status("[bold cyan]Attente de l'ordonnanceur et du worker...", spinner="dots") as status_ui:
        while True:
            time.sleep(2)
            check_resp = client.get(f"/labs/{lab_id}")
            current = check_resp.json()
            st = current.get("statut")

            if st == "RUNNING":
                status_ui.update(f"[bold blue]Worker en cours de démarrage du conteneur...")
            elif st == "READY":
                print(f"[bold green][PRÊT][/bold green] Le lab #{lab_id} est opérationnel !")
                conn = current.get("infos_connexion", "Non renseigné")
                print(Panel(f"[bold]Accès :[/bold] [green]{conn}[/green]", title="Connexion"))
                break
            elif st == "FAILED":
                print(f"[bold red][ÉCHEC][/bold red] Le déploiement du lab #{lab_id} a échoué.")
                raise typer.Exit(code=1)