alter table negocios
  add column if not exists correo text,
  add column if not exists representante text,
  add column if not exists tipo_documento text,
  add column if not exists numero_documento text,
  add column if not exists ciudad_indicativo text,
  add column if not exists contacto_principal text,
  add column if not exists descripcion text,
  add column if not exists slogan text;
