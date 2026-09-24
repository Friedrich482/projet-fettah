import time
from typing import Annotated, Optional
import typer
from rich import print
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from labhacker.client import APIClient

labs_app = typer.Typer(help="Gestion et réservation des environnements de lab.")
console = Console()

STATUS_COLORS = {
    "PENDING": "yellow",
    "RUNNING": "cyan",
    "READY": "bold green",
    "STOPPED": "magenta",
    "FAILED": "bold red",
    "EXPIRED": "dim white",
}


def _format_resources(res_data: dict) -> str:
    """Extrait dynamiquement les métadonnées de ressources sans aucune valeur en dur."""
    resources = res_data.get("resources") or {}
    cpu = resources.get("cpu") or res_data.get("cpu")
    ram = resources.get("ram") or res_data.get("ram")

    if cpu and ram:
        return f"{cpu} / {ram}"
    if cpu:
        return str(cpu)
    if ram:
        return str(ram)
    return "Non alloué"


@labs_app.command("list")
def list_labs():
    """Lister vos réservations d'instances avec leurs ressources et états (US30)."""
    client = APIClient()
    response = client.get("/reservations")
    reservations = response.json()

    if not reservations:
        print("[yellow]Aucune réservation trouvée.[/yellow]")
        return

    table = Table(title="Vos Réservations Lab Hacker", header_style="bold cyan")
    table.add_column("ID", justify="center", style="dim")
    table.add_column("Image / Machine", style="magenta")
    table.add_column("Statut", justify="center")
    table.add_column("Worker", justify="center", style="blue")
    table.add_column("Ressources", justify="center")
    table.add_column("Temps restant", justify="center", style="yellow")
    table.add_column("Accès", style="green")

    for res in reservations:
        st = str(res.get("statut", "UNKNOWN")).upper()
        color = STATUS_COLORS.get(st, "white")
        formatted_status = f"[{color}]{st}[/{color}]"

        # Toutes les données sont lues dynamiquement depuis la réponse API
        worker = res.get("worker_id") or res.get("worker") or "-"
        resources_display = _format_resources(res)
        remaining = res.get("temps_restant") or res.get("remaining_time") or "-"
        access = res.get("infos_connexion") or res.get("access_url") or "-"
        image_name = res.get("image") or res.get("machine_type") or "-"

        table.add_row(
            str(res.get("id")),
            image_name,
            formatted_status,
            str(worker),
            resources_display,
            str(remaining),
            str(access),
        )

    console.print(table)


@labs_app.command("reserve")
def reserve_lab(
    image: Annotated[str, typer.Option("--image", "-i", prompt="Image demandée (ex: kali, ubuntu, web-pentest)", help="Image du lab")],
    duration: Annotated[int, typer.Option("--duration", "-d", help="Durée de validité en minutes")] = 60,
    cpu: Annotated[Optional[str], typer.Option("--cpu", help="Limite CPU souhaitée (ex: 2)")] = None,
    ram: Annotated[Optional[str], typer.Option("--ram", help="Limite RAM souhaitée (ex: 2G)")] = None,
    wait: Annotated[bool, typer.Option("--wait", "-w", help="Attendre que l'instance soit prête")] = False,
):
    """Créer une nouvelle réservation d'instance temporaire (US22, US29)."""
    client = APIClient()
    
    # Construction dynamique de la requête
    payload = {
        "image": image,
        "duration_minutes": duration,
    }
    if cpu:
        payload["cpu"] = cpu
    if ram:
        payload["ram"] = ram

    response = client.post("/reservations", json_data=payload)
    data = response.json()
    res_id = data.get("id")

    print(f"[bold green][RÉSERVÉ][/bold green] Réservation #{res_id} enregistrée pour [cyan]{duration} min[/cyan].")

    if not wait:
        print(f"[yellow]Réservation en file d'attente (PENDING). Suivez l'état avec :[/yellow] [bold cyan]labhacker status {res_id}[/bold cyan]")
        return

    with console.status("[bold cyan]Attente du Scheduler et affectation d'un Worker...", spinner="dots") as status_ui:
        while True:
            time.sleep(2)
            check_resp = client.get(f"/reservations/{res_id}")
            current = check_resp.json()
            st = str(current.get("statut", "")).upper()

            if st == "RUNNING":
                status_ui.update("[bold blue]Instance en cours de démarrage sur le Worker...")
            elif st == "READY":
                print(f"[bold green][PRÊT][/bold green] L'instance #{res_id} est opérationnelle !")
                access = current.get("infos_connexion") or current.get("access_url") or "Non renseigné"
                worker = current.get("worker_id") or current.get("worker") or "Inconnu"
                res_display = _format_resources(current)
                
                console.print(
                    Panel(
                        f"[bold]Worker :[/bold] {worker}\n"
                        f"[bold]Ressources :[/bold] {res_display}\n"
                        f"[bold]Accès :[/bold] [green]{access}[/green]\n"
                        f"[bold]Durée :[/bold] {duration} minutes",
                        title=f"Lab #{res_id} Opérationnel",
                        expand=False,
                    )
                )
                break
            elif st == "FAILED":
                print(f"[bold red][ÉCHEC][/bold red] Échec du déploiement ou ressources épuisées sur les Workers.")
                raise typer.Exit(code=1)


@labs_app.command("status")
def get_status(
    reservation_id: Annotated[str, typer.Argument(help="Identifiant de la réservation")],
):
    """Afficher les détails complets d'une instance et sa réservation (US30)."""
    client = APIClient()
    response = client.get(f"/reservations/{reservation_id}")
    res = response.json()

    st = str(res.get("statut", "UNKNOWN")).upper()
    color = STATUS_COLORS.get(st, "white")
    access = res.get("infos_connexion") or res.get("access_url") or "Non disponible"
    worker = res.get("worker_id") or res.get("worker") or "Non affecté"
    resources_display = _format_resources(res)
    remaining = res.get("temps_restant") or res.get("remaining_time") or "Inconnu"

    body = (
        f"[bold]Image :[/bold] {res.get('image', '-')}\n"
        f"[bold]Statut :[/bold] [{color}]{st}[/{color}]\n"
        f"[bold]Worker affecté :[/bold] {worker}\n"
        f"[bold]Ressources réelles :[/bold] {resources_display}\n"
        f"[bold]Temps restant :[/bold] {remaining}\n"
        f"[bold]Accès Reverse Proxy :[/bold] [green]{access}[/green]"
    )
    console.print(Panel(body, title=f"Détails Réservation #{reservation_id}", expand=False))


@labs_app.command("start")
def start_instance(
    reservation_id: Annotated[str, typer.Argument(help="Identifiant de la réservation / machine")],
):
    """Démarrer ou réveiller une instance arrêtée (US05, US29)."""
    client = APIClient()
    client.post(f"/machines/{reservation_id}/start")
    print(f"[bold green][DÉMARRÉ][/bold green] Ordre de démarrage transmis pour l'instance #{reservation_id}.")


@labs_app.command("stop")
def stop_instance(
    reservation_id: Annotated[str, typer.Argument(help="Identifiant de la réservation / machine")],
):
    """Arrêter temporairement une instance sans la détruire (US05, US29)."""
    client = APIClient()
    client.post(f"/machines/{reservation_id}/stop")
    print(f"[bold yellow][STOPPÉ][/bold yellow] Ordre d'arrêt transmis pour l'instance #{reservation_id}.")


@labs_app.command("delete")
def delete_reservation(
    reservation_id: Annotated[str, typer.Argument(help="Identifiant de la réservation à libérer")],
    force: Annotated[bool, typer.Option("--yes", "-y", help="Confirmer sans invite")] = False,
):
    """Libérer une réservation et détruire l'instance associée (US24, US29)."""
    if not force:
        confirm = typer.confirm(f"Êtes-vous sûr de vouloir libérer et détruire la réservation #{reservation_id} ?")
        if not confirm:
            print("[yellow]Opération annulée.[/yellow]")
            return

    client = APIClient()
    client.delete(f"/reservations/{reservation_id}")
    print(f"[bold green][LIBÉRÉ][/bold green] La réservation #{reservation_id} a été supprimée et le conteneur détruit.")