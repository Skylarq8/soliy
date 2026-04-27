-- Categories table (dynamic, tree structure)
CREATE TABLE categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  parent_id   TEXT REFERENCES categories(id) ON DELETE SET NULL,
  icon        TEXT DEFAULT '📦',
  fields      JSONB NOT NULL DEFAULT '[]',
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anyone to read categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (TRUE);

-- Drop the hardcoded CHECK constraint on listings.category
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_category_check;

-- Seed top-level categories
INSERT INTO categories (id, name, icon, sort_order, fields) VALUES

('clothing', 'Хувцас', '👗', 1, '[
  {"key":"brand","label":"Брэнд","type":"text","required":false,"placeholder":"Nike, Zara..."},
  {"key":"size_local","label":"Монгол хэмжээ","type":"select","required":true,"options":["XS","S","M","L","XL","XXL","XXXL"]},
  {"key":"size_intl","label":"Олон улсын хэмжээ","type":"text","required":false,"placeholder":"EU 38, US 8..."},
  {"key":"color","label":"Өнгө","type":"text","required":false,"placeholder":"Цэнхэр, Улаан..."},
  {"key":"material","label":"Материал","type":"text","required":false,"placeholder":"Хөвөн, Дэн..."},
  {"key":"wash_count","label":"Угаасан тоо","type":"number","required":false},
  {"key":"style_tags","label":"Стайл таг","type":"tags","required":false,"placeholder":"vintage, casual, y2k..."}
]'),

('skincare', 'Арьс засал', '✨', 2, '[
  {"key":"product_name","label":"Бүтээгдэхүүний нэр","type":"text","required":true,"placeholder":"Toner, Serum..."},
  {"key":"brand","label":"Брэнд","type":"text","required":true,"placeholder":"COSRX, Laneige..."},
  {"key":"percent_used","label":"Хэдэн хувь ашигласан","type":"select","required":true,"options":["10%","25%","50%","75%","90%+"]},
  {"key":"opened_count","label":"Хэдэн удаа нээсэн","type":"number","required":false},
  {"key":"expiry_date","label":"Дуусах огноо","type":"date","required":false},
  {"key":"is_sealed","label":"Битүүмжлэгдсэн","type":"boolean","required":false},
  {"key":"skin_type","label":"Арьсны төрөл","type":"select","required":false,"options":["Хуурай","Тослог","Хосолсон","Мэдрэмтгий","Бүх төрөл"]}
]'),

('makeup', 'Гоо сайхан', '💄', 3, '[
  {"key":"product_name","label":"Бүтээгдэхүүний нэр","type":"text","required":true,"placeholder":"Foundation, Lipstick..."},
  {"key":"brand","label":"Брэнд","type":"text","required":true,"placeholder":"MAC, Maybelline..."},
  {"key":"shade","label":"Өнгөний дугаар / нэр","type":"text","required":false,"placeholder":"N20, Rose Nude..."},
  {"key":"percent_used","label":"Хэдэн хувь ашигласан","type":"select","required":true,"options":["10%","25%","50%","75%","90%+"]},
  {"key":"formula_type","label":"Текстур","type":"select","required":false,"options":["Liquid","Cream","Powder","Stick","Gel"]},
  {"key":"hygiene_note","label":"Эрүүл ахуйн тэмдэглэл","type":"text","required":false,"placeholder":"Lash, lip бараанд заавал бичнэ үү"}
]'),

('accessories', 'Аксессуар', '💍', 4, '[
  {"key":"brand","label":"Брэнд","type":"text","required":false},
  {"key":"material","label":"Материал","type":"text","required":false,"placeholder":"Мөнгө, Алт, Хуванцар..."},
  {"key":"color","label":"Өнгө","type":"text","required":false},
  {"key":"dimensions","label":"Хэмжээ","type":"text","required":false,"placeholder":"25cm x 10cm..."},
  {"key":"hardware_condition","label":"Арматурын байдал","type":"select","required":false,"options":["Шинэ","Маш сайн","Сайн","Дунд","Муу"]}
]'),

('bag', 'Цүнх', '👜', 5, '[
  {"key":"brand","label":"Брэнд","type":"text","required":true,"placeholder":"Zara, Gucci..."},
  {"key":"material","label":"Материал","type":"select","required":true,"options":["Арьс","Зохиомол арьс","Даавуу","Канвас","Бусад"]},
  {"key":"color","label":"Өнгө","type":"text","required":true},
  {"key":"dimensions","label":"Хэмжээ","type":"text","required":false,"placeholder":"30x20x10 см"},
  {"key":"authenticity","label":"Жинхэнэ эсэх","type":"select","required":true,"options":["Өөрөө мэдүүлсэн жинхэнэ","Баталгаажсан жинхэнэ","Репліка"]}
]'),

('perfume', 'Үнэртэн', '🌸', 6, '[
  {"key":"product_name","label":"Үнэртний нэр","type":"text","required":true},
  {"key":"brand","label":"Брэнд","type":"text","required":true},
  {"key":"ml_remaining","label":"Үлдсэн мл","type":"number","required":true},
  {"key":"total_ml","label":"Нийт хэмжээ (мл)","type":"number","required":false},
  {"key":"has_original_box","label":"Анхны хайрцагтай эсэх","type":"boolean","required":false},
  {"key":"scent_type","label":"Үнэрийн ангилал","type":"select","required":false,"options":["Floral","Woody","Fresh","Oriental","Fruity","Aquatic"]}
]');
