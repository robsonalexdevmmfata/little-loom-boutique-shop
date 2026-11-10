-- ============================================================
-- SO A PARTE DE CRIAR USER + BANCO
-- Login no pgAdmin: usuario "postgres" (padrao) → banco "postgres"
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'reinoir') THEN
    CREATE ROLE reinoir LOGIN PASSWORD '320809';
  ELSE
    ALTER ROLE reinoir WITH LOGIN PASSWORD '320809';
  END IF;
END
$$;

CREATE DATABASE reinoir
  OWNER reinoir
  ENCODING 'UTF8'
  TEMPLATE template0;

GRANT ALL PRIVILEGES ON DATABASE reinoir TO reinoir;

-- Depois: Refresh → abra o banco "reinoir" → rode 02_schema.sql e 03_seed.sql
