import re
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
    "DESTROYED": "dim red",
}


def _parse_image_input(image_input: str) -> tuple[str, str]:
    """Sépare le nom de l'image et son tag (défaut: latest)."""
    if ":" in image_input:
        parts = image_input.rsplit(":", 1)
        return parts[0], parts[1]
    return image_input, "latest"


def _parse_ram_to_mb(ram_input: Optional[str]) -> int:
    """Convertit une chaîne (ex: '2048', '2G', '512M') en entier de Mo positif."""
    if not ram_input:
        return 1024  # Valeur par défaut : 1 Go

    clean_str = ram_input.strip().upper()
    match = re.match(r"^(\d+)\s*(GO|G|MO|M)?$", clean_str)
    if not match:
        raise typer.BadParameter(f"Format de RAM invalide : '{ram_input}'. Utilisez par exemple '1024', '1G' ou '2048M'.")

    val = int(match.group(1))
    unit = match.group(2)

    if unit in ("G", "GO"):
        return val * 1024
    return val


@labs_app.command("reserve")
def reserve_lab(
    image: Annotated[str, typer.Option("--image", "-i", prompt="Image ou template (ex: kalilinux/kali-rolling ou kali:latest)", help="Image du lab")],
    duration: Annotated[int, typer.Option("--duration", "-d", help="Durée de validité en minutes")] = 60,
    cpu: Annotated[int, typer.Option("--cpu", help="Nombre de vCPU alloués")] = 1,
    ram: Annotated[str, typer.Option("--ram", help="Quantité de RAM (ex: 1024, 2G)")] = "1024",
    wait: Annotated[bool, typer.Option("--wait", "-w", help="Attendre que l'instance soit prête")] = False,
):
    """Créer une nouvelle réservation d'instance temporaire."""
    client = APIClient()

    image_name, image_tag = _parse_image_input(image)
    ram_mb = _parse_ram_to_mb(ram)

    # Payload strictement conforme au schéma CreateReservationInputSchema
    payload = {
        "imageName": image_name,
        "imageTag": image_tag,
        "duration": int(duration),
        "machineCpu": int(cpu),
        "machineRam": int(ram_mb),
    }

    response = client.post("/reservations", json_data=payload)
    data = response.json()
    res_id = data.get("id")

    print(f"[bold green][RÉSERVÉ][/bold green] Réservation #{res_id} enregistrée pour [cyan]{duration} min[/cyan].")
    print(f"Image demandée : [magenta]{image_name}:{image_tag}[/magenta] | CPU : [cyan]{cpu}[/cyan] | RAM : [cyan]{ram_mb} Mo[/cyan]")

    if not wait:
        print(f"[yellow]Suivez l'état avec :[/yellow] [bold cyan]labhacker status {res_id}[/bold cyan]")
        return

    with console.status("[bold cyan]Attente de l'ordonnanceur et déploiement du conteneur...", spinner="dots") as status_ui:
        while True:
            time.sleep(2)
            check_resp = client.get(f"/reservations/{res_id}")
            current = check_resp.json()
            st = str(current.get("status") or current.get("statut") or "").upper()

            if st in ("RUNNING", "PROVISIONING"):
                status_ui.update(f"[bold blue]Instance en cours de préparation ({st})...")
            elif st in ("READY", "SUCCESS"):
                print(f"[bold green][PRÊT][/bold green] L'instance #{res_id} est opérationnelle !")
                break
            elif st in ("FAILED", "ERROR"):
                print(f"[bold red][ÉCHEC][/bold red] Échec du déploiement.")
                raise typer.Exit(code=1)


@labs_app.command("list")
def list_labs():
    """Lister vos réservations (affichage direct des données renvoyées par l'API)."""
    client = APIClient()
    response = client.get("/reservations")
    reservations = response.json()

    if not reservations:
        print("[yellow]Aucune réservation trouvée.[/yellow]")
        return

    table = Table(title="Vos Réservations Lab Hacker", header_style="bold cyan")
    table.add_column("ID", justify="center", style="dim")
    table.add_column("Statut", justify="center")
    table.add_column("Durée", justify="center")
    table.add_column("Expiration", justify="center", style="yellow")
    table.add_column("Fin", justify="center", style="dim")

    for res in reservations:
        st = str(res.get("status") or res.get("statut") or "-").upper()
        color = STATUS_COLORS.get(st, "white")
        formatted_status = f"[{color}]{st}[/{color}]" if st != "-" else "-"

        table.add_row(
            str(res.get("id", "-")),
            formatted_status,
            f"{res.get('duration', '-')} min",
            str(res.get("expiresAt", "-")),
            str(res.get("endedAt", "-")),
        )

    console.print(table)


@labs_app.command("status")
def get_status(
    reservation_id: Annotated[str, typer.Argument(help="Identifiant de la réservation")],
):
    """Afficher les détails bruts d'une réservation retournés par l'API."""
    client = APIClient()
    response = client.get(f"/reservations/{reservation_id}")
    res = response.json()

    st = str(res.get("status") or res.get("statut") or "-").upper()
    color = STATUS_COLORS.get(st, "white")

    lines = [
        f"[bold]ID :[/bold] {res.get('id', '-')}",
        f"[bold]Statut :[/bold] [{color}]{st}[/{color}]",
        f"[bold]Durée :[/bold] {res.get('duration', '-')} minutes",
        f"[bold]Date d'expiration :[/bold] {res.get('expiresAt', '-')}",
        f"[bold]Date de fin :[/bold] {res.get('endedAt', '-')}",
    ]

    # Si l'API joint un jour l'objet machine ou image, on l'affiche directement sans bloquer
    if "machine" in res and isinstance(res["machine"], dict):
        m = res["machine"]
        lines.append(f"[bold]Machine ID :[/bold] {m.get('id', '-')}")
        lines.append(f"[bold]Statut Machine :[/bold] {m.get('status', '-')}")

    console.print(Panel("\n".join(lines), title=f"Détails Réservation #{reservation_id}", expand=False))


@labs_app.command("start")
def start_instance(
    reservation_id: Annotated[str, typer.Argument(help="Identifiant de la machine / réservation")],
):
    """Démarrer ou réveiller une instance arrêtée (En attente du contrôleur API)."""
    client = APIClient()
    client.post(f"/machines/{reservation_id}/start")
    print(f"[bold green][DÉMARRÉ][/bold green] Ordre de démarrage transmis pour #{reservation_id}.")


@labs_app.command("stop")
def stop_instance(
    reservation_id: Annotated[str, typer.Argument(help="Identifiant de la machine / réservation")],
):
    """Arrêter temporairement une instance (En attente du contrôleur API)."""
    client = APIClient()
    client.post(f"/machines/{reservation_id}/stop")
    print(f"[bold yellow][STOPPÉ][/bold yellow] Ordre d'arrêt transmis pour #{reservation_id}.")


@labs_app.command("delete")
def delete_reservation(
    reservation_id: Annotated[str, typer.Argument(help="Identifiant de la réservation à libérer")],
    force: Annotated[bool, typer.Option("--yes", "-y", help="Confirmer sans invite")] = False,
):
    """Libérer une réservation (En attente de l'exposition oRPC)."""
    if not force:
        confirm = typer.confirm(f"Êtes-vous sûr de vouloir supprimer la réservation #{reservation_id} ?")
        if not confirm:
            print("[yellow]Opération annulée.[/yellow]")
            return

    client = APIClient()
    client.delete(f"/reservations/{reservation_id}")
    print(f"[bold green][LIBÉRÉ][/bold green] La réservation #{reservation_id} a été supprimée.")