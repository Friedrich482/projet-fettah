import typer

from labhacker.commands.authentification import auth_app, login, logout, whoami
from labhacker.commands.labs import (
    delete_reservation,
    get_status,
    labs_app,
    list_labs,
    reserve_lab,
    start_instance,
    stop_instance,
)

# Application racine
app = typer.Typer(
    name="labhacker",
    help="Plateforme Lab Hacker — CLI de réservation et gestion dynamique de labs de pentest.",
    no_args_is_help=True,
)

# 1. Montage des sous-groupes (structure modulaire)
app.add_typer(auth_app, name="auth")
app.add_typer(labs_app, name="lab")

# 2. Commandes d'authentification directes au premier niveau
app.command(name="login", help="S'authentifier auprès de la plateforme avec son e-mail.")(login)
app.command(name="logout", help="Déconnecter la session locale.")(logout)
app.command(name="whoami", help="Afficher l'utilisateur actuellement connecté.")(whoami)

# 3. Commandes de gestion de lab directes au premier niveau (US29, US30)
app.command(name="reserve", help="Réserver une nouvelle machine temporaire (avec durée et ressources).")(reserve_lab)
app.command(name="list", help="Lister vos réservations d'instances avec états et ressources réelles.")(list_labs)
app.command(name="status", help="Afficher les détails complets d'une réservation.")(get_status)
app.command(name="start", help="Démarrer ou réveiller une instance.")(start_instance)
app.command(name="stop", help="Arrêter temporairement une instance.")(stop_instance)
app.command(name="delete", help="Libérer une réservation et détruire le conteneur associé.")(delete_reservation)

if __name__ == "__main__":
    app()