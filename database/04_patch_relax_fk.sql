-- Rode no banco reinoir se upsert de produtos falhar por FK de categoria
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_fkey;
