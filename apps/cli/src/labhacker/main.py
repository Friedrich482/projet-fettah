import typer

from labhacker.commands.authentification import auth_app, login, logout, whoami
from labhacker.commands.labs import (
    connect_instance,
    delete_reservation,
    get_status,
    labs_app,
    list_images,
    list_labs,
    reserve_lab,
    start_instance,
    stop_instance,
)

app = typer.Typer(
    name="labhacker",
    help="Plateforme Lab Hacker — CLI de réservation et gestion de labs de pentest.",
    no_args_is_help=True,
)

# Sous-commandes groupées
app.add_typer(auth_app, name="auth")
app.add_typer(labs_app, name="lab")

# Commandes racine (US28 à US31)
app.command(name="login", help="S'authentifier auprès de la plateforme.")(login)
app.command(name="logout", help="Déconnecter la session locale.")(logout)
app.command(name="whoami", help="Afficher l'utilisateur actuellement connecté.")(whoami)

app.command(name="images", help="Lister les images disponibles.")(list_images)
app.command(name="reserve", help="Réserver une nouvelle machine temporaire.")(reserve_lab)
app.command(name="list", help="Lister vos réservations.")(list_labs)
app.command(name="status", help="Afficher les détails d'une réservation.")(get_status)
app.command(name="connect", help="Obtenir les accès SSH à la machine.")(connect_instance)
app.command(name="start", help="Démarrer une machine.")(start_instance)
app.command(name="stop", help="Arrêter temporairement une machine.")(stop_instance)
app.command(name="delete", help="Libérer une réservation et détruire la machine.")(delete_reservation)

if __name__ == "__main__":
    app()