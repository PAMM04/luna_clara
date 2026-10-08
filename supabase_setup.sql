-- ============================================================
-- SCRIPT DE CONFIGURACIÓN SUPABASE: LUNA CLARA
-- ============================================================
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase:
-- https://supabase.com/dashboard/project/_/sql

-- 1. CREACIÓN DE LA TABLA 'productos'
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL,
    tallas TEXT[] NOT NULL DEFAULT '{}',
    colores TEXT[] NOT NULL DEFAULT '{}',
    variantes JSONB NOT NULL DEFAULT '[]'::jsonb,
    cantidad_disponible INT NOT NULL DEFAULT 0,
    disponible BOOLEAN NOT NULL DEFAULT true,
    imagen_url TEXT NOT NULL
);

-- Si la tabla ya fue creada previamente, ejecuta esta línea para habilitar variantes con foto:
ALTER TABLE public.productos 
ADD COLUMN IF NOT EXISTS variantes JSONB NOT NULL DEFAULT '[]'::jsonb;


-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS DE ACCESO PARA 'productos'
-- 3.1 Lectura pública (clientes anónimos y autenticados)
DROP POLICY IF EXISTS "Lectura pública de productos" ON public.productos;
CREATE POLICY "Lectura pública de productos"
ON public.productos FOR SELECT
USING (true);

-- 3.2 Modificación y creación (Solo Administrador Autenticado)
DROP POLICY IF EXISTS "Modificación solo para administrador autenticado" ON public.productos;
CREATE POLICY "Modificación solo para administrador autenticado"
ON public.productos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. CONFIGURACIÓN DEL STORAGE BUCKET: 'imagenes-productos'
-- Insertar el bucket público para las imágenes
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagenes-productos', 'imagenes-productos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de acceso para storage.objects
DROP POLICY IF EXISTS "Lectura pública de imágenes de productos" ON storage.objects;
CREATE POLICY "Lectura pública de imágenes de productos"
ON storage.objects FOR SELECT
USING (bucket_id = 'imagenes-productos');

DROP POLICY IF EXISTS "Subida de imágenes solo autenticados" ON storage.objects;
CREATE POLICY "Subida de imágenes solo autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'imagenes-productos');

DROP POLICY IF EXISTS "Actualización de imágenes solo autenticados" ON storage.objects;
CREATE POLICY "Actualización de imágenes solo autenticados"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'imagenes-productos');

DROP POLICY IF EXISTS "Eliminación de imágenes solo autenticados" ON storage.objects;
CREATE POLICY "Eliminación de imágenes solo autenticados"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'imagenes-productos');

-- 5. PRODUCTOS DE EJEMPLO (Opcional para pruebas iniciales)
INSERT INTO public.productos (nombre, descripcion, precio, tallas, colores, cantidad_disponible, disponible, imagen_url)
VALUES 
(
    'Vestido Floral Primavera',
    'Vestido midi con caída fluida, escote en V y estampado botánico en tonos pastel. Tela ligera y fresca ideal para media estación.',
    189.90,
    ARRAY['S', 'M', 'L'],
    ARRAY['Blanco Floral', 'Rosa Pastel'],
    8,
    true,
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
),
(
    'Blusa Satinada Luna Champagne',
    'Elegante blusa en satén de seda con cuello drapeado y botones nacarados. Versátil para eventos formales o looks casual chic.',
    129.00,
    ARRAY['XS', 'S', 'M', 'L'],
    ARRAY['Champagne', 'Negro Obsidiana'],
    12,
    true,
    'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80'
),
(
    'Pantalón Palazzo Lino Natural',
    'Pantalón de tiro alto con pretina elástica posterior y bolsillos laterales. Confeccionado en 100% lino orgánico transpirable.',
    155.00,
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY['Beige Arena', 'Blanco Crudo'],
    5,
    true,
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80'
),
(
    'Blazer Oversize Classic Noir',
    'Blazer sastrero contemporáneo con solapas estructuradas y forro interior suave. Corte impecable para elevar cualquier outfit.',
    240.00,
    ARRAY['S', 'M'],
    ARRAY['Negro', 'Camel'],
    3,
    true,
    'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=80'
),
(
    'Top Tejido Rib Escote Cuadrado',
    'Crop top de tejido canalé de punto fino, elástico y cómodo. Combina a la perfección con prendas de tiro alto.',
    75.00,
    ARRAY['Única', 'S', 'M'],
    ARRAY['Terracota', 'Oliva', 'Blanco'],
    0,
    false,
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
);
