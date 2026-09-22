from typing import Any, Dict, Optional
import requests
import typer
from rich import print

from src.labhacker.config import get_api_url, get_token


class APIClient:
    """Point d'entrée unique pour toutes les requêtes vers le reverse proxy."""

    def __init__(self):
        self.base_url = get_api_url()
        self.token = get_token()

    def _get_headers(self) -> Dict[str, str]:
        """Prépare les en-têtes HTTP avec le token JWT si disponible."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None,
    ) -> requests.Response:
        """Exécute la requête HTTP et gère les erreurs de transport et d'API."""
        url = f"{self.base_url}{endpoint}"

        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self._get_headers(),
                params=params,
                json=json_data,
                timeout=10,  # Évite de bloquer indéfiniment si le proxy est injoignable
            )
        except requests.exceptions.ConnectionError:
            print(f"[bold red][ERREUR][/bold red] Impossible de contacter le reverse proxy sur [underline]{self.base_url}[/underline].")
            print("[yellow]Vérifie que tes conteneurs Docker sont bien démarrés.[/yellow]")
            raise typer.Exit(code=1) from None
        except requests.exceptions.Timeout:
            print("[bold red][ERREUR][/bold red] Délai d'attente dépassé (timeout de 10s).")
            raise typer.Exit(code=1) from None

        # Interception des erreurs HTTP courantes
        if response.status_code == 401:
            print("[bold red][NON AUTORISÉ][/bold red] Session expirée ou jeton manquant.")
            print("Lance d'abord la commande : [bold cyan]labhacker login[/bold cyan]")
            raise typer.Exit(code=1) from None

        if response.status_code == 403:
            print("[bold red][ACCÈS REFUSÉ][/bold red] Vous n'avez pas les droits nécessaires.")
            raise typer.Exit(code=1) from None

        if response.status_code >= 400:
            try:
                detail = response.json().get("detail", response.text)
            except Exception:
                detail = response.text
            print(f"[bold red][ERREUR {response.status_code}][/bold red] {detail}")
            raise typer.Exit(code=1) from None

        return response

    # Méthodes raccourcies pratiques
    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> requests.Response:
        return self.request("GET", endpoint, params=params)

    def post(self, endpoint: str, json_data: Optional[Dict[str, Any]] = None) -> requests.Response:
        return self.request("POST", endpoint, json_data=json_data)

    def delete(self, endpoint: str) -> requests.Response:
        return self.request("DELETE", endpoint)