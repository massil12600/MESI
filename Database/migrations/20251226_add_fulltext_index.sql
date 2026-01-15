-- Migration example pour Postgres : index full-text + trigger
-- Attention: adapter le nom de la table/colonnes selon votre schéma

BEGIN;

-- 1) Ajouter colonne tsvector si nécessaire
ALTER TABLE IF EXISTS games
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2) Remplir la colonne existante
UPDATE games
SET search_vector = to_tsvector('french', coalesce(name,'') || ' ' || coalesce(description,''))
WHERE search_vector IS NULL;

-- 3) Créer index GIN pour recherche full-text
CREATE INDEX IF NOT EXISTS idx_games_search_vector ON games USING GIN (search_vector);

-- 4) Créer trigger pour maintenir le tsvector à jour
CREATE OR REPLACE FUNCTION games_search_vector_update() RETURNS trigger AS $$
begin
  new.search_vector := to_tsvector('french', coalesce(new.name,'') || ' ' || coalesce(new.description,''));
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_games_search_vector ON games;
CREATE TRIGGER trg_games_search_vector
BEFORE INSERT OR UPDATE ON games
FOR EACH ROW EXECUTE FUNCTION games_search_vector_update();

-- 5) Index sur colonnes de filtre (adapter selon types : text/array)
-- Si `genres` est text simple
CREATE INDEX IF NOT EXISTS idx_games_genre ON games (genre);

-- Si `platforms` est tableau (text[]), utiliser GIN
-- CREATE INDEX IF NOT EXISTS idx_games_platforms_gin ON games USING GIN (platforms);

COMMIT;

-- Notes:
-- - Si vous préférez utiliser l'extension pg_trgm pour LIKE/ILIKE rapide, installez et créez index GIN/GiST.
-- - Pour très grand dataset, préférez keyset pagination pour les endpoints paginés.
