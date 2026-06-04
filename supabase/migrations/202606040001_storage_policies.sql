-- Storage RLS policies for negocio-assets bucket.
-- Public read is intentional: logos and brand assets are served publicly.
-- Write operations are restricted to authenticated admins of the owning negocio.

create policy "negocio_assets_public_read"
on storage.objects for select
to public
using (bucket_id = 'negocio-assets');

create policy "negocio_assets_admin_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'negocio-assets'
  and (public.is_super_admin() or (public.is_admin() and public.own_negocio_activo()))
);

create policy "negocio_assets_admin_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'negocio-assets'
  and (public.is_super_admin() or (public.is_admin() and public.own_negocio_activo()))
);

create policy "negocio_assets_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'negocio-assets'
  and (public.is_super_admin() or (public.is_admin() and public.own_negocio_activo()))
);
