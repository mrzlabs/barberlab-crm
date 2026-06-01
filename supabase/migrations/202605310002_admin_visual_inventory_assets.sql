alter table public.inventario
  add column if not exists descripcion text,
  add column if not exists foto_url text;
