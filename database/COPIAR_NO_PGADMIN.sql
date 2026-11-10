-- ============================================================
-- ARQUIVO ÚNICO PARA COPIAR (opcional)
--
-- PASSO A — rode no banco "postgres" (só a parte 1)
-- PASSO B — conecte no banco "reinoir" e rode a parte 2 + 3
--
-- Ou use os arquivos separados:
--   01_criar_banco.sql  → no postgres
--   02_schema.sql       → no reinoir
--   03_seed.sql         → no reinoir
-- ============================================================

-- ========== PARTE 1 (banco postgres) ==========
CREATE ROLE reinoir LOGIN PASSWORD '320809';
CREATE DATABASE reinoir OWNER reinoir ENCODING 'UTF8' TEMPLATE template0;
GRANT ALL PRIVILEGES ON DATABASE reinoir TO reinoir;

-- Pare aqui, mude a conexão para o banco "reinoir",
-- depois rode 02_schema.sql e 03_seed.sql
