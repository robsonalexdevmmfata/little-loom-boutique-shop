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
