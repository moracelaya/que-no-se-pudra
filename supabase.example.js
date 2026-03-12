// supabase.example.js — Plantilla de configuración
// Copiá este archivo como supabase.js y completá con tus datos reales.
// Encontrás los valores en: supabase.com → tu proyecto → Settings → API

const SUPABASE_URL  = 'https://TU_PROYECTO.supabase.co'
const SUPABASE_ANON = 'TU_ANON_PUBLIC_KEY'

const { createClient } = window.supabase
const db = createClient(SUPABASE_URL, SUPABASE_ANON)

// ─── Tabla requerida en Supabase ───────────────────────────────────────────
//
// CREATE TABLE ingredients (
//   id       SERIAL PRIMARY KEY,
//   name     TEXT NOT NULL,
//   emoji    TEXT NOT NULL,
//   category TEXT NOT NULL  -- 'proteinas' | 'verduras' | 'bases'
// );
//
// ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "public read" ON ingredients FOR SELECT USING (true);
//
// INSERT INTO ingredients (name, emoji, category) VALUES
//   ('huevo',    '🥚', 'proteinas'),
//   ('pollo',    '🍗', 'proteinas'),
//   ('atún',     '🐟', 'proteinas'),
//   ('queso',    '🧀', 'proteinas'),
//   ('cebolla',  '🧅', 'verduras'),
//   ('tomate',   '🍅', 'verduras'),
//   ('zanahoria','🥕', 'verduras'),
//   ('papa',     '🥔', 'verduras'),
//   ('pimiento', '🫑', 'verduras'),
//   ('ajo',      '🧄', 'verduras'),
//   ('arroz',    '🍚', 'bases'),
//   ('pasta',    '🍝', 'bases'),
//   ('pan',      '🍞', 'bases');
