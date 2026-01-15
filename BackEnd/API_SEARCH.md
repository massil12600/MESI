# API: Recherche et filtrage — `GET /api/games`

## Endpoint

`GET /api/games`

## Paramètres query

- `q` (string, optional): recherche texte (full-text) sur `name`, `description`.
- `genres[]` (string, optional): filtres multi-valeurs pour genres.
- `platforms[]` (string, optional): filtres multi-valeurs pour plateformes.
- `minRating` (number, optional): filtre note minimale (ex: 3.5).
- `sort` (string, optional): tri, valeurs supportées: `relevance`, `rating_desc`, `rating_asc`, `newest`, `oldest`.
- `page` (integer, optional): numéro de page (défaut 1).
- `pageSize` (integer, optional): éléments par page (défaut 20, max 100).

## Exemple de requête

GET /api/games?q=zelda&genres[]=RPG&platforms[]=Switch&minRating=4&page=1&pageSize=20&sort=rating_desc

## Réponse (200)

{
  "items": [
    {
      "id": 123,
      "name": "Titre du jeu",
      "slug": "titre-du-jeu",
      "descriptionSnippet": "Courte description...",
      "genres": ["Action","Aventure"],
      "platforms": ["PC","Switch"],
      "rating": 4.5,
      "thumbnail": "/media/thumbs/123.jpg"
    }
  ],
  "total": 452,
  "page": 1,
  "pageSize": 20
}

## Comportement & recommandations

- Utiliser full-text search (Postgres `tsvector`/GIN ou moteur équivalent) pour `q`.
- Quand `q` est fourni, renvoyer `sort=relevance` par défaut.
- Valider et sanitiser les paramètres côté serveur (ex: `pageSize` <= 100).
- Supporter pagination OFFSET+LIMIT ou keyset pour grandes tables (préférer keyset pour perf).
- Limiter champs retournés (pas d'informations sensibles).
- Ajouter protection rate-limit sur l'endpoint.

## Validation suggérée

- `q`: string max 300 chars
- `genres[]`, `platforms[]`: valeurs parmi liste autorisée
- `minRating`: float entre 0 et 5
- `page`, `pageSize`: entiers positifs

## Notes de déploiement

- Si Postgres: créer index GIN sur `to_tsvector` et trigger de mise à jour (`tsvector_update_trigger`).
- Prévoir cache (Redis) pour requêtes fréquentes (même combinaisons de filtres).
