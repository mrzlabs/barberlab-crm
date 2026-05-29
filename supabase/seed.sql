-- Seed base Ego's Barberia y Peluqueria
-- Crear primero el usuario Auth admin en Supabase y reemplazar el UUID.

insert into public.usuarios (id, email, rol, nombre, telefono, activo)
values (
  '00000000-0000-0000-0000-000000000001',
  'admin@egosbarberia.com',
  'admin',
  'Admin Ego''s Barberia',
  '3503803010',
  true
)
on conflict (id) do nothing;

insert into public.servicios (categoria, nombre, duracion_min, precio, costo_insumo, activo)
values
  ('barberia', 'Corte clasico', 40, 25000, 2500, true),
  ('barberia', 'Corte + barba', 60, 40000, 4000, true),
  ('barberia', 'Barba perfilada', 25, 18000, 1800, true),
  ('peluqueria', 'Corte dama', 50, 35000, 3500, true),
  ('peluqueria', 'Cepillado', 45, 30000, 4500, true),
  ('peluqueria', 'Tintura base', 120, 95000, 28000, true),
  ('spa_unas', 'Manicure tradicional', 45, 25000, 5000, true),
  ('spa_unas', 'Pedicure tradicional', 55, 30000, 6500, true),
  ('spa_unas', 'Semipermanente', 75, 55000, 12000, true),
  ('tatuajes', 'Tatuaje pequeño', 90, 120000, 22000, true),
  ('tatuajes', 'Retoque tatuaje', 60, 70000, 10000, true)
on conflict do nothing;

insert into public.inventario (sku, nombre, categoria, unidad, stock, costo_unitario, stock_minimo, activo)
values
  ('BAR-GEL-001', 'Gel fijador', 'barberia', 'ml', 3000, 35, 500, true),
  ('BAR-TAL-001', 'Talco barberia', 'barberia', 'g', 2000, 18, 300, true),
  ('PEL-TIN-001', 'Tinte base', 'peluqueria', 'ml', 1800, 120, 300, true),
  ('PEL-SHA-001', 'Shampoo profesional', 'peluqueria', 'ml', 5000, 22, 800, true),
  ('UNA-ESM-001', 'Esmalte tradicional', 'spa_unas', 'ml', 1200, 80, 200, true),
  ('UNA-SEM-001', 'Esmalte semipermanente', 'spa_unas', 'ml', 900, 145, 150, true),
  ('TAT-AGU-001', 'Agujas tatuaje', 'tatuajes', 'unidad', 120, 1800, 20, true),
  ('TAT-TIN-001', 'Tinta negra', 'tatuajes', 'ml', 600, 220, 100, true)
on conflict (sku) do nothing;

insert into public.servicio_insumos (servicio_id, inventario_id, cantidad)
select s.id, i.id, x.cantidad
from (
  values
    ('Corte clasico', 'BAR-GEL-001', 8::numeric),
    ('Corte + barba', 'BAR-GEL-001', 12::numeric),
    ('Corte + barba', 'BAR-TAL-001', 6::numeric),
    ('Barba perfilada', 'BAR-TAL-001', 4::numeric),
    ('Cepillado', 'PEL-SHA-001', 20::numeric),
    ('Tintura base', 'PEL-TIN-001', 90::numeric),
    ('Manicure tradicional', 'UNA-ESM-001', 12::numeric),
    ('Pedicure tradicional', 'UNA-ESM-001', 16::numeric),
    ('Semipermanente', 'UNA-SEM-001', 18::numeric),
    ('Tatuaje pequeño', 'TAT-AGU-001', 2::numeric),
    ('Tatuaje pequeño', 'TAT-TIN-001', 18::numeric),
    ('Retoque tatuaje', 'TAT-TIN-001', 10::numeric)
) as x(servicio_nombre, sku, cantidad)
join public.servicios s on s.nombre = x.servicio_nombre
join public.inventario i on i.sku = x.sku
on conflict (servicio_id, inventario_id) do nothing;
