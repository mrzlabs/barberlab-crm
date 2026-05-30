alter table negocios
  add column if not exists comision_base text not null default 'precio_final',
  add column if not exists propina_en_comision boolean not null default false;

update negocios
set
  comision_base = coalesce(comision_base, 'precio_final'),
  propina_en_comision = coalesce(propina_en_comision, false)
where comision_base is null
   or propina_en_comision is null;

do $$
begin
  alter table negocios
    add constraint negocios_comision_base_chk
    check (comision_base in ('precio_final', 'precio_menos_descuento', 'precio_menos_insumo'));
exception
  when duplicate_object then null;
end $$;
