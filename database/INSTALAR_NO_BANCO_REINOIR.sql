-- ============================================================
-- REIS NOIR — INSTALACAO COMPLETA (schema + dados)
-- USE ESTE ARQUIVO (nao rode 02 e 03 separados)
--
-- No pgAdmin:
--   1. Login: usuario "postgres"
--   2. Clique no banco "reinoir" (se nao existir, rode 01_criar_banco.sql
--      no banco "postgres" antes)
--   3. Botao direito em "reinoir" → Query Tool
--   4. Cole ESTE arquivo inteiro → F5
--
-- Confira no topo da Query Tool se o banco selecionado e "reinoir"
-- (nao "postgres").
-- ============================================================

-- Garante o role da loja (mesmo se o 01 nao foi rodado)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'reinoir') THEN
    CREATE ROLE reinoir LOGIN PASSWORD '320809';
  END IF;
END
$$;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- Catálogo ----------
CREATE TABLE IF NOT EXISTS categories (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL UNIQUE,
  image         TEXT NOT NULL DEFAULT '',
  subcategories TEXT[] NOT NULL DEFAULT '{}',
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug             TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL,
  subcategory      TEXT,
  price            NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  promo            NUMERIC(12,2) CHECK (promo IS NULL OR promo >= 0),
  stock            INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_by_size    JSONB NOT NULL DEFAULT '{}'::jsonb,
  image            TEXT NOT NULL DEFAULT '',
  gallery          TEXT[] NOT NULL DEFAULT '{}',
  description      TEXT NOT NULL DEFAULT '',
  details          TEXT[] NOT NULL DEFAULT '{}',
  composition      TEXT,
  care             TEXT,
  color            TEXT,
  sku              TEXT,
  sizes            TEXT[] NOT NULL DEFAULT '{}',
  show_in_vitrine  BOOLEAN NOT NULL DEFAULT TRUE,
  featured         BOOLEAN NOT NULL DEFAULT FALSE,
  is_new           BOOLEAN NOT NULL DEFAULT FALSE,
  best             BOOLEAN NOT NULL DEFAULT FALSE,
  status           TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('publicado', 'rascunho')),
  seo_title        TEXT,
  seo_description  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- ---------- Pedidos ----------
CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,
  customer        TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  total           NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  status          TEXT NOT NULL DEFAULT 'Aguardando pagamento'
                    CHECK (status IN ('Aguardando pagamento', 'Pago', 'Enviado', 'Entregue')),
  order_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  items_count     INT NOT NULL DEFAULT 0,
  payment         TEXT CHECK (payment IS NULL OR payment IN ('PIX', 'Cartão', 'Boleto')),
  city            TEXT,
  note            TEXT,
  tracking_code   TEXT,
  tracking_url    TEXT,
  shipping_label  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id          BIGSERIAL PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  size        TEXT,
  qty         INT NOT NULL CHECK (qty > 0),
  unit_price  NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0)
);

-- ---------- Cupons / comércio ----------
CREATE TABLE IF NOT EXISTS coupons (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code       TEXT NOT NULL UNIQUE,
  type       TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value      NUMERIC(12,2) NOT NULL CHECK (value >= 0),
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  min_order  NUMERIC(12,2) NOT NULL DEFAULT 0,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commerce_config (
  id                   INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name           TEXT NOT NULL DEFAULT 'REIS NOIR',
  store_url_label      TEXT NOT NULL DEFAULT 'reisnoir',
  free_shipping_from   NUMERIC(12,2) NOT NULL DEFAULT 500,
  flat_shipping        NUMERIC(12,2) NOT NULL DEFAULT 29.90,
  support_email        TEXT NOT NULL DEFAULT 'contato@reisnoir.com.br',
  low_stock_threshold  INT NOT NULL DEFAULT 5,
  maintenance_mode     BOOLEAN NOT NULL DEFAULT FALSE,
  maintenance_message  TEXT NOT NULL DEFAULT 'Estamos em manutenção rápida. Volte em instantes.',
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- Settings da vitrine (JSON flexível + campos chave) ----------
CREATE TABLE IF NOT EXISTS store_settings (
  id          INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- CMS extras ----------
CREATE TABLE IF NOT EXISTS faq_items (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id  TEXT REFERENCES products(id) ON DELETE SET NULL,
  author      TEXT NOT NULL,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text        TEXT NOT NULL,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  approved    BOOLEAN NOT NULL DEFAULT FALSE,
  avatar      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);

CREATE TABLE IF NOT EXISTS newsletter_subs (
  email      TEXT PRIMARY KEY,
  subscribed_at DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS activity_log (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  who        TEXT NOT NULL,
  action     TEXT NOT NULL,
  detail     TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_activity_at ON activity_log(at DESC);

CREATE TABLE IF NOT EXISTS admin_users (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('dono', 'atendente')),
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_config (
  id         INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled    BOOLEAN NOT NULL DEFAULT FALSE,
  ga_id      TEXT NOT NULL DEFAULT '',
  gtm_id     TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_popup (
  id            INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  title         TEXT NOT NULL DEFAULT '',
  text          TEXT NOT NULL DEFAULT '',
  cta           TEXT NOT NULL DEFAULT '',
  cta_href      TEXT NOT NULL DEFAULT '/#novidades',
  dismiss_days  INT NOT NULL DEFAULT 5,
  home_only     BOOLEAN NOT NULL DEFAULT TRUE,
  delay_ms      INT NOT NULL DEFAULT 1600,
  coupon_code   TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_config (
  id                     INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  home_title             TEXT NOT NULL DEFAULT 'REIS NOIR — Moda feminina sofisticada',
  home_description       TEXT NOT NULL DEFAULT '',
  product_title_suffix   TEXT NOT NULL DEFAULT '— REIS NOIR',
  default_og_image       TEXT NOT NULL DEFAULT '',
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meta_ads_config (
  id           INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled      BOOLEAN NOT NULL DEFAULT FALSE,
  pixel_id     TEXT NOT NULL DEFAULT '',
  catalog_id   TEXT NOT NULL DEFAULT '',
  extra        JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_library (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name       TEXT NOT NULL,
  url        TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id          TEXT PRIMARY KEY,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  items       JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_hint  NUMERIC(12,2) NOT NULL DEFAULT 0,
  email       TEXT,
  phone       TEXT
);

-- Permissoes para o user da loja
GRANT USAGE ON SCHEMA public TO reinoir;
GRANT ALL ON ALL TABLES IN SCHEMA public TO reinoir;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO reinoir;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO reinoir;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO reinoir;
-- ============================================================
-- REIS NOIR — dados iniciais (opcional)
-- Rode no banco "reinoir" depois do 02_schema.sql
-- ============================================================

INSERT INTO commerce_config (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO store_settings (id, data) VALUES (
  1,
  '{
    "promoText": "Primeira compra? Ganhe 10% OFF com o cupom BEMVINDA",
    "promoActive": true,
    "footerPolicy1": "Privacidade",
    "footerPolicy2": "Trocas e devoluções",
    "footerPolicy3": "Entrega",
    "policyBody1": "Cuidamos dos seus dados com responsabilidade.",
    "policyBody2": "Trocas em até 7 dias após o recebimento.",
    "policyBody3": "Enviamos para todo o Brasil com rastreio.",
    "footerAbout": "Moda feminina sofisticada, elegante e contemporânea.",
    "footerWhatsappLabel": "(11) 99552-3083",
    "footerWhatsappNumber": "5511995523083",
    "footerInstagram": "reis_noir",
    "footerCopyright": "© 2026 REIS NOIR. Todos os direitos reservados."
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO analytics_config (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO campaign_popup (id, active, title, text, cta, cta_href, coupon_code)
VALUES (
  1, TRUE,
  'Bem-vinda à REIS NOIR',
  'Ganhe 10% na primeira compra. Use o cupom no checkout e descubra a coleção.',
  'Ver coleção', '/#novidades', 'BEMVINDA'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO seo_config (id, home_title, home_description)
VALUES (
  1,
  'REIS NOIR — Moda feminina sofisticada',
  'Conjuntos, vestidos, macacões e blazers com presença. Frete para todo o Brasil.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO meta_ads_config (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO coupons (id, code, type, value, active, min_order, note)
VALUES ('c1', 'BEMVINDA', 'percent', 10, TRUE, 0, 'Primeira compra')
ON CONFLICT (code) DO NOTHING;

INSERT INTO categories (id, name, image, subcategories, sort_order) VALUES
  ('cat-conjuntos', 'Conjuntos', '', ARRAY['Tomara que caia','Alfaiataria','Saia midi','Wide leg'], 1),
  ('cat-vestidos', 'Vestidos', '', ARRAY['Midi com capa','Gola alta','Slip','Tubinho','Assimétrico'], 2),
  ('cat-macacoes', 'Macacões', '', ARRAY['Alfaiataria','Frente única','Pantacourt','Envelope'], 3),
  ('cat-blazers', 'Blazers', '', ARRAY['Oversized','Alongado','Cropped'], 4)
ON CONFLICT (name) DO NOTHING;

INSERT INTO faq_items (id, question, answer, sort_order) VALUES
  ('f1', 'Qual o prazo de entrega?', 'Após a confirmação do pagamento, o envio sai em até 2 dias úteis. O prazo Melhor Envio aparece no checkout.', 1),
  ('f2', 'Posso trocar o tamanho?', 'Sim. Trocas em até 7 dias após o recebimento, com a peça sem uso e com etiquetas. Fale pelo WhatsApp.', 2),
  ('f3', 'Quais formas de pagamento?', 'PIX, cartão em até 12x e boleto via Mercado Pago.', 3)
ON CONFLICT (id) DO NOTHING;

-- Senhas demo iguais ao painel atual (1234 / loja) — troque em produção
INSERT INTO admin_users (id, name, role, password_hash) VALUES
  ('u1', 'Dono', 'dono', crypt('1234', gen_salt('bf'))),
  ('u2', 'Atendimento', 'atendente', crypt('loja', gen_salt('bf')))
ON CONFLICT (id) DO NOTHING;

INSERT INTO reviews (id, product_id, author, rating, text, approved, avatar) VALUES
  (
    'r1', NULL, 'Fernanda Dias', 5,
    'Caimento impecável e tecido nobre. Chegou rápido e a embalagem é um mimo.',
    TRUE,
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces'
  ),
  (
    'r2', NULL, 'Larissa Mendes', 5,
    'Usei no jantar e todo mundo perguntou de onde era. Virei fã.',
    TRUE,
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces'
  ),
  (
    'r3', NULL, 'Camila Rocha', 5,
    'Alfaiataria perfeita. Parece feita sob medida — e o vinho combina com tudo.',
    TRUE,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces'
  )
ON CONFLICT (id) DO NOTHING;
