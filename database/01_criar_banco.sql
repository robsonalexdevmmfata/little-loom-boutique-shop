-- ============================================================
-- PASSO 1 — usuario PADRAO do PostgreSQL = "postgres"
--
-- No pgAdmin:
--   Login com:  usuario postgres  +  a senha que VOCE criou na instalacao
--   Abra o banco: postgres
--   Botao direito em "postgres" → Query Tool → cole isto → F5
--
-- Ainda NAO existe usuario "reinoir". Ele e criado abaixo.
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

-- Se o banco ainda nao existe, rode a linha abaixo.
-- Se der "already exists", ignore e siga em frente.
CREATE DATABASE reinoir
  OWNER reinoir
  ENCODING 'UTF8'
  TEMPLATE template0;

GRANT ALL PRIVILEGES ON DATABASE reinoir TO reinoir;
