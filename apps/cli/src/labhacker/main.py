import typer

from labhacker.commands.authentification import auth_app
from labhacker.commands.labs import (
    create_lab,
    delete_lab,
    get_status,
    labs_app,
    list_labs,
)

# Application racine
app = typer.Typer(
    name="labhacker",
    help="Plateforme Lab Hacker — Interface en ligne de commande pour piloter vos labs de pentest.",
    no_args_is_help=True,
)

# 1. Ajout des groupes de sous-commandes
app.add_typer(auth_app, name="auth")
app.add_typer(labs_app, name="lab")

# 2. Déclaration de raccourcis directs au premier niveau
app.command(name="login", help="S'authentifier auprès de la plateforme.")(auth_app.registered_commands[0].callback)
app.command(name="logout", help="Déconnecter la session locale.")(auth_app.registered_commands[1].callback)
app.command(name="list", help="Lister vos labs actifs.")(list_labs)
app.command(name="create", help="Demander le déploiement d'un nouveau lab.")(create_lab)
app.command(name="status", help="Afficher les détails d'un lab.")(get_status)
app.command(name="delete", help="Détruire un conteneur de lab.")(delete_lab)

if __name__ == "__main__":
    app()