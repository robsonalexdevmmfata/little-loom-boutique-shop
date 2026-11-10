-- ============================================================
-- REIS NOIR — criar usuário e banco no PostgreSQL
-- Rode conectado no banco "postgres" (usuário postgres / admin).
--
-- pgAdmin: botão direito no servidor → Query Tool → Execute (F5)
-- psql:    psql -U postgres -f database/01_criar_banco.sql
--
-- Se o usuário/banco já existir, ignore o erro e siga para 02_schema.sql
-- ============================================================

CREATE ROLE reinoir LOGIN PASSWORD '320809';

CREATE DATABASE reinoir
  OWNER reinoir
  ENCODING 'UTF8'
  TEMPLATE template0;

GRANT ALL PRIVILEGES ON DATABASE reinoir TO reinoir;

-- Depois de criar, conecte no banco "reinoir" e rode 02_schema.sql
--
-- Conexão:
--   Host:     localhost
--   Porta:    5432
--   Database: reinoir
--   User:     reinoir
--   Password: 320809
--   URL:      postgresql://reinoir:320809@localhost:5432/reinoir
