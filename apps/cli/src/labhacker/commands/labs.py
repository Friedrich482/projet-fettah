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
    """Convertit une chaîne (ex: '2048', '2G', '512M') en Mo entier positif."""
    if not ram_input:
        return 1024

    clean_str = ram_input.strip().upper()
    match = re.match(r"^(\d+)\s*(GO|G|MO|M)?$", clean_str)
    if not match:
        raise typer.BadParameter(f"Format de RAM invalide : '{ram_input}'. Utilisez '1024', '1G' ou '2048M'.")

    val = int(match.group(1))
    unit = match.group(2)

    if unit in ("G", "GO"):
        return val * 1024
    return val


def _resolve_machine_id(client: APIClient, identifier: str) -> str:
    """
    Résout l'ID de machine requis par l'API :
    Vérifie si l'identifiant saisi est directement un machine.id,
    sinon interroge GET /machines pour trouver la machine associée au reservationId.
    """
    try:
        response = client.get("/machines")
        machines = response.json()
    except Exception:
        # Si la route n'est pas accessible, on tente l'identifiant brut
        return identifier

    if isinstance(machines, list):
        # 1. Vérification si l'identifiant est directement un machine_id
        for m in machines:
            if str(m.get("id")) == str(identifier):
                return identifier

        # 2. Résolution via reservationId
        for m in machines:
            if str(m.get("reservationId")) == str(identifier):
                return str(m.get("id"))

    # Si non résolu, on retourne l'identifiant d'origine par défaut
    return identifier


@labs_app.command("images")
def list_images():
    """Lister les images et templates disponibles sur la plateforme."""
    client = APIClient()
    response = client.get("/images")
    images = response.json()

    if not images:
        print("[yellow]Aucune image disponible enregistrée.[/yellow]")
        return

    table = Table(title="Images Docker Disponibles", header_style="bold cyan")
    table.add_column("Nom", style="magenta")
    table.add_column("Tag", style="cyan")
    table.add_column("Max CPU", justify="center")
    table.add_column("Max RAM", justify="center")

    for img in images:
        max_ram = f"{img.get('maxRam')} Mo" if img.get("maxRam") else "-"
        max_cpu = str(img.get("maxCpu", "-"))
        table.add_row(
            str(img.get("name", "-")),
            str(img.get("tag", "latest")),
            max_cpu,
            max_ram,
        )

    console.print(table)


@labs_app.command("reserve")
def reserve_lab(
    image: Annotated[str, typer.Option("--image", "-i", prompt="Image ou template (ex: kalilinux/kali-rolling:latest)", help="Image du lab")],
    duration: Annotated[int, typer.Option("--duration", "-d", help="Durée de validité en minutes")] = 60,
    cpu: Annotated[int, typer.Option("--cpu", help="Nombre de vCPU alloués")] = 1,
    ram: Annotated[str, typer.Option("--ram", help="Quantité de RAM (ex: 1024, 2G)")] = "1024",
    wait: Annotated[bool, typer.Option("--wait", "-w", help="Attendre que l'instance soit prête")] = False,
):
    """Créer une nouvelle réservation d'instance temporaire."""
    client = APIClient()

    image_name, image_tag = _parse_image_input(image)
    ram_mb = _parse_ram_to_mb(ram)

    payload = {
        "imageName": image_name,
        "imageTag": image_tag,
        "duration": int(duration),
        "machineCpu": int(cpu),
        "machineRam": int(ram_mb),
    }

    response = client.post("/reservations", json_data=payload)
    data = response.json()

    # Extraction propre de l'ULID (data["reservation"]["id"] selon CreateReservationOutputSchema)
    reservation_data = data.get("reservation") if isinstance(data.get("reservation"), dict) else data
    res_id = reservation_data.get("id")

    print(f"[bold green][RÉSERVÉ][/bold green] Réservation #[cyan]{res_id}[/cyan] enregistrée pour [cyan]{duration} min[/cyan].")
    print(f"Image demandée : [magenta]{image_name}:{image_tag}[/magenta] | CPU : [cyan]{cpu}[/cyan] | RAM : [cyan]{ram_mb} Mo[/cyan]")

    if not wait:
        print(f"[yellow]Suivez l'état avec :[/yellow] [bold cyan]labhacker status {res_id}[/bold cyan]")
        return

    with console.status("[bold cyan]Attente de l'ordonnanceur et déploiement du conteneur...", spinner="dots") as status_ui:
        while True:
            time.sleep(2)
            check_resp = client.get(f"/reservations/{res_id}")
            current = check_resp.json()
            st = str(current.get("status") or "").upper()

            if st in ("PENDING", "PROVISIONING"):
                status_ui.update(f"[bold blue]Instance en cours de préparation ({st})...")
            elif st in ("RUNNING", "READY", "SUCCESS"):
                print(f"[bold green][PRÊT][/bold green] L'instance #[cyan]{res_id}[/cyan] est opérationnelle !")
                print(f"[cyan]Pour récupérer l'accès SSH :[/cyan] labhacker connect {res_id}")
                break
            elif st in ("FAILED", "ERROR"):
                print(f"[bold red][ÉCHEC][/bold red] Échec du déploiement.")
                raise typer.Exit(code=1)


@labs_app.command("list")
def list_labs():
    """Lister vos réservations (ULID complet sans troncature)."""
    client = APIClient()
    response = client.get("/reservations")
    reservations = response.json()

    if not reservations:
        print("[yellow]Aucune réservation trouvée.[/yellow]")
        return

    table = Table(
        title="Vos Réservations Lab Hacker",
        header_style="bold cyan",
        expand=True,
    )
    # overflow="fold" empêche les "..." et affiche les 26 caractères sur une seconde ligne si l'écran est trop serré
    table.add_column("ID Réservation", justify="center", style="cyan", overflow="fold", min_width=26)
    table.add_column("Statut", justify="center")
    table.add_column("Durée", justify="center")
    table.add_column("Expiration", justify="center", style="yellow")
    table.add_column("Fin", justify="center", style="dim")

    for res in reservations:
        st = str(res.get("status") or "-").upper()
        color = STATUS_COLORS.get(st, "white")
        formatted_status = f"[{color}]{st}[/{color}]" if st != "-" else "-"

        table.add_row(
            str(res.get("id", "-")),
            formatted_status,
            f"{res.get('duration', '-')} min",
            str(res.get("expiresAt") or "-"),
            str(res.get("endedAt") or "-"),
        )

    console.print(table)


@labs_app.command("status")
def get_status(
    reservation_id: Annotated[str, typer.Argument(help="Identifiant ULID de la réservation")],
):
    """Afficher les détails d'une réservation."""
    client = APIClient()
    response = client.get(f"/reservations/{reservation_id}")
    res = response.json()

    st = str(res.get("status") or "-").upper()
    color = STATUS_COLORS.get(st, "white")

    lines = [
        f"[bold]ID :[/bold] [cyan]{res.get('id', '-')}[/cyan]",
        f"[bold]Statut :[/bold] [{color}]{st}[/{color}]",
        f"[bold]Durée :[/bold] {res.get('duration', '-')} minutes",
        f"[bold]Date d'expiration :[/bold] {res.get('expiresAt') or '-'}",
        f"[bold]Date de fin :[/bold] {res.get('endedAt') or '-'}",
    ]

    console.print(Panel("\n".join(lines), title=f"Détails Réservation", expand=False))

@labs_app.command("connect")
def connect_instance(
    identifier: Annotated[str, typer.Argument(help="Identifiant de la réservation ou de la machine")],
):
    """Récupérer les accès SSH d'une machine en cours d'exécution."""
    client = APIClient()
    machine_id = _resolve_machine_id(client, identifier)

    response = client.post(f"/machines/{machine_id}/connect")
    data = response.json()

    host = data.get("host", "127.0.0.1")
    port = data.get("port", 22)
    user = data.get("username", "root")
    pwd = data.get("password", "-")

    ssh_cmd = f"ssh {user}@{host} -p {port}"

    content = (
        f"[bold]Machine ID :[/bold] {data.get('machineId', machine_id)}\n"
        f"[bold]Statut :[/bold] [green]{data.get('status', 'running')}[/green]\n"
        f"[bold]Hôte :[/bold] {host}\n"
        f"[bold]Port :[/bold] {port}\n"
        f"[bold]Utilisateur :[/bold] [cyan]{user}[/cyan]\n"
        f"[bold]Mot de passe :[/bold] [yellow]{pwd}[/yellow]\n\n"
        f"[bold]Commande rapide :[/bold]\n[dim]{ssh_cmd}[/dim]"
    )
    console.print(Panel(content, title="Informations de Connexion SSH", expand=False))


@labs_app.command("start")
def start_instance(
    identifier: Annotated[str, typer.Argument(help="Identifiant de la réservation ou de la machine")],
):
    """Démarrer ou réveiller une instance arrêtée."""
    client = APIClient()
    machine_id = _resolve_machine_id(client, identifier)

    client.post(f"/machines/{machine_id}/start")
    print(f"[bold green][DÉMARRÉ][/bold green] Ordre de démarrage transmis pour la machine #{machine_id}.")


@labs_app.command("stop")
def stop_instance(
    identifier: Annotated[str, typer.Argument(help="Identifiant de la réservation ou de la machine")],
):
    """Arrêter temporairement une instance sans la détruire."""
    client = APIClient()
    machine_id = _resolve_machine_id(client, identifier)

    client.post(f"/machines/{machine_id}/stop")
    print(f"[bold yellow][STOPPÉ][/bold yellow] Ordre d'arrêt transmis pour la machine #{machine_id}.")


@labs_app.command("delete")
def delete_reservation(
    reservation_id: Annotated[str, typer.Argument(help="Identifiant de la réservation à détruire")],
    force: Annotated[bool, typer.Option("--yes", "-y", help="Confirmer sans invite")] = False,
):
    """Libérer une réservation et détruire l'instance associée."""
    if not force:
        confirm = typer.confirm(f"Êtes-vous sûr de vouloir supprimer la réservation #{reservation_id} ?")
        if not confirm:
            print("[yellow]Opération annulée.[/yellow]")
            return

    client = APIClient()
    client.delete(f"/reservations/{reservation_id}")
    print(f"[bold green][LIBÉRÉ][/bold green] La réservation #{reservation_id} a été supprimée.")