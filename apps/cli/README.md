### quelques commandes
python -c "from src.labhacker.config import get_api_url, get_token;print('URL:',get_api_url());print('Token:',get_token())" x


# TRES  IMPORTANT  A FAIRE  A CHAQUE FOIS QU'ON PULL LE REPOS OU L'IMPORTE 
  //activer la virtualisation de python
python3 -m venv .venv
source .venv/bin/activate
pip install -e .                       installer les utilitaires disponibles avec 
accès au ligne de commande dans le dossier appi/cli environnement déja virtualisé
# S'authentifier auprès de l'API (e-mail + mot de passe masqué)
labhacker login

# Afficher les informations de session courante
labhacker whoami

# Déconnecter la session et supprimer le jeton local
labhacker logout

# Modifier l'URL de base du Reverse Proxy Traefik (défaut : http://localhost/api)
labhacker auth set-url http://localhost/api 
# Consulter la liste de vos réservations et instances actives
labhacker list

# Réserver une machine temporaire (image kali, durée 60 minutes)
labhacker reserve --image kali --duration 60

# Réserver avec allocation spécifique et attente active jusqu'au statut READY
labhacker reserve --image kali --duration 120 --cpu 2 --ram 2G --wait

# Consulter l'état détaillé d'une instance spécifique (ID ou UUID)
labhacker status 42

# Démarrer ou réveiller une instance arrêtée
labhacker start 42

# Arrêter temporairement une instance sans la détruire
labhacker stop 42

# Libérer la réservation et détruire le conteneur associé
labhacker delete 42
 
 souviens toi que la structure du projet est de cette forme :
 apps/cli/
├── pyproject.toml               # Configuration de packaging setuptools et dépendances
├── README.md                    # Documentation du CLI
└── src/
    └── labhacker/               # Paquet racine
        ├── __init__.py
        ├── client.py            # Client HTTP centralisé (gestion des tokens, erreurs et URL)
        ├── config.py            # Gestion du fichier ~/.labhacker/config.json
        ├── main.py              # Point d'entrée Typer et déclaration des commandes
        └── commands/
            ├── __init__.py
            ├── authentification.py # Commandes auth (login, logout, whoami, set-url)
            └── labs.py          # Commandes métier (reserve, list, status, start, stop, delete)
 
 
 
 ###