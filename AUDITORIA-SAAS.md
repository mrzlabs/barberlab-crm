# Auditoría integral — Operux CRM (BarberLab)

**Fecha:** 14 de julio de 2026
**Alcance:** código completo del repo `barberlab-crm` + recorrido en navegador de todas las vistas (modo demo local, los 4 roles) + análisis del despliegue en Vercel.
**Objetivo:** convertir el CRM en un SaaS comercial de nivel profesional que **funcione como ERP**: fuente de verdad de inventario, ventas, compras y caja del negocio, con arquitectura de eventos para integraciones (referencia adoptada: Push Mechanism de Shopee Open Platform — ver Fases 6 y 7 del roadmap).

> Nota de método: la URL compartida (`barberlab-5y10o485m-…vercel.app`) está protegida por Vercel SSO y **no es accesible públicamente** (redirige al login de Vercel). La auditoría de UI se hizo ejecutando el mismo código en local con `npm run dev:demo`; la auditoría funcional y de permisos se hizo sobre el código fuente, migraciones SQL y RLS.

---

## 0. Resumen ejecutivo

El producto tiene una base sólida (multi-tenant real con RLS, Server Actions con validación Zod, modelo citas→turnos bien pensado), pero hoy no es vendible como SaaS por cuatro razones:

1. **Bugs bloqueantes de negocio**: el panel Super Admin y la Configuración crashean en modo demo; crear un negocio falla sin ningún feedback al usuario; el modo demo está roto en producción por una inconsistencia middleware/sesión.
2. **Identidad visual "generada por IA"**: tema oscuro violeta/cian, neones, mascota flotante, gradientes, tarjetas con `rounded-[2rem]` y decoración "mac-dots" en 20 lugares. Es exactamente lo contrario a un software empresarial premium.
3. **Responsive roto en móvil**: el bot de ayuda con `z-index: 9999` tapa "Cerrar sesión", el perfil y el menú; el footer-firma se solapa consigo mismo; tablas cortadas; títulos que pisan botones.
4. **Sin sistema de diseño**: 11 archivos redefinen su propio estilo de input; no existen componentes Button/Input/Table compartidos; `components/ui` solo tiene 3 archivos.

---

## 1. Los 3 problemas reportados — diagnóstico de causa raíz

### 1.1 "Desde Super Admin no fue posible crear un nuevo local"

Hay **dos escenarios** según cómo esté desplegado, y ambos están rotos:

**Escenario A — El deploy corre en modo demo (`OPERUX_DEMO_MODE=true`):**
- `lib/super-admin/queries.ts` tiene **cero** soporte de modo demo (`isDemoMode` aparece 0 veces, contra 9 en `lib/admin/queries.ts`). `getNegocios()` intenta conectarse a la base real y la página `/super-admin/negocios` **crashea completa** (reproducido en local: `ECONNREFUSED 127.0.0.1:54322`, pantalla "Unhandled Runtime Error"). El super admin nunca ve el formulario.
- Además `middleware.ts` desactiva el demo cuando `NODE_ENV=production` (`effectiveDemoMode`), pero `lib/auth/session.ts` y `lib/demo.ts` **no** aplican esa misma regla. Resultado en Vercel: el login demo pone la cookie, el middleware la ignora, y el usuario rebota a `/login` en bucle. Inconsistencia de una sola fuente de verdad.

**Escenario B — El deploy corre contra Supabase real:**
`createNegocio` (`app/super-admin/negocios/actions.ts`) puede fallar por cuatro vías y **ninguna muestra error al usuario** (el `<form action={createNegocio}>` no usa `useFormState` ni try/catch: cualquier `throw` termina en la página de error genérica de Next con un "digest"):
1. **`SUPABASE_SERVICE_ROLE_KEY` ausente en Vercel** → `createSupabaseAdminClient()` lanza `"SUPABASE_SERVICE_ROLE_KEY no configurada"`. Es la causa más probable si el resto de la app funciona.
2. **Validación Zod que lanza**: `negocioSchema.parse()` explota si el slug no cumple `^[a-z0-9-]+$` (escribir "Mi Barbería" falla), si el teléfono del admin tiene menos de 7 caracteres, o si el password tiene menos de 8. No hay validación en el cliente que lo anticipe.
3. **Slug duplicado** → violación de constraint única sin manejar.
4. **Email de admin ya registrado en Supabase Auth** → error de `auth.admin.createUser`; el negocio se revierte, pero el usuario solo ve una pantalla de error.

**Bug adicional encontrado:** el checkbox "Incluir propina en comisión" usa `z.coerce.boolean()` con un input hidden `value="false"`. En JavaScript `Boolean("false") === true`, así que **la propina siempre entra a la comisión aunque el checkbox esté desmarcado**. Afecta la liquidación de comisiones de todos los negocios creados.

**RLS:** las políticas de `negocios` (`202605290003_multi_tenant_branding.sql`) son correctas (`negocios_super_admin_write` con `is_super_admin()`), pero son **irrelevantes para este bug**: Drizzle se conecta por `DATABASE_URL` como rol `postgres`, que ignora RLS. El problema no es de permisos de base de datos, es de manejo de errores y variables de entorno.

### 1.2 "No fue posible configurar correctamente un nuevo negocio"

- `/admin/configuracion` **crashea en modo demo** (reproducido): la página llama a `getNegocioById()` (que vive en `lib/super-admin/queries.ts`, sin soporte demo) y hace un `getDb().select()` directo en el cuerpo de la página. Doble acoplamiento: una vista de admin depende del módulo super-admin.
- En modo real, el flujo de "configurar un negocio nuevo" no existe como flujo: el super admin llena un formulario monolítico de **más de 20 campos** (identidad, colores, fuente, plan, regla contable, credenciales del admin) en una sola columna, y después el admin del negocio tiene que descubrir solo que debe crear servicios → empleados → horarios → inventario antes de que la agenda funcione. No hay wizard, no hay checklist, no hay estados vacíos que guíen.
- El password inicial del admin lo escribe el super admin a mano y viaja en texto plano por el formulario. Debería ser una invitación por email con `mustChangePassword` (el campo ya existe en el esquema y el flujo `/cambiar-clave` ya existe — solo falta usarlo aquí).

### 1.3 "En móvil la barra invade la firma y tapa cerrar sesión / perfil / menú"

Causa raíz triple, verificada en código y reproducida con viewport 375×812:

1. **`MrzHelpBot.tsx:460`** — el panel del bot usa `position: fixed; bottom: 100; zIndex: 9999`. La escala de z-index del shell es: header sticky `z-20`, sidebar `z-40`, slide-over de perfil `z-50`. El bot (9999) queda **encima de todo**: tapa el botón "Cerrar sesión" del sidebar, las opciones del perfil y el menú. Su burbuja "Hola, soy Maylo" además cubre las últimas filas de las tablas.
2. **`MrzSignature.tsx`** — el footer-firma usa un grid de 3 columnas con offsets fijos (`left: 20, right: 80`) que a 375 px colapsa: "© 2026 Todos los derechos reserva…", "OPERUX" y "…UILT BY MRZLABS" se pisan entre sí (capturado en pantalla). Encima corre un canvas de partículas con `requestAnimationFrame` permanente.
3. **`AppChrome.tsx`** — en el drawer móvil, el título del negocio ("Smart Style") se solapa con el botón X de cerrar; el header sticky + tab bar consumen ~84 px fijos de un viewport de 812.

---

## 2. Auditoría por pantalla

### Autenticación
| Vista | Hallazgos |
|---|---|
| `/login` | Estética "IA" máxima: fondo de constelaciones animado, gradiente cian→violeta en el botón, mascota robot 3D en la esquina. El checkbox de términos deshabilita el botón sin explicar por qué. Errores solo por query param (`?error=auth`) sin mensajes específicos. Rate limiter en memoria (inútil en serverless, ya documentado en el propio código). No hay "olvidé mi contraseña" funcional (es un botón que no recupera nada). |
| `/cambiar-clave` | Flujo existe pero no está conectado a la creación de usuarios por super admin. |
| `/unauthorized` | Página huérfana sin navegación de retorno clara. |

### Super Admin (auditado por código; en demo crashea todo el módulo)
| Vista | Hallazgos |
|---|---|
| `/super-admin/negocios` | Formulario de creación de 20+ campos en una columna; hero de marketing ("MRZLABS · SaaS Control Panel") que ocupa ~200 px sin aportar; KPIs con MRR **hardcodeado** (starter=90k, pro=180k, enterprise=450k en el propio JSX); sección "Capacidades SaaS" de 4 tarjetas puramente decorativas; sin manejo de errores del formulario; sin paginación ni búsqueda en la tabla de negocios. |
| `/super-admin/negocios/[id]` | 357 líneas; mezcla edición de negocio, usuarios, reset de passwords en una sola vista. Reset de password escribe la clave en texto plano en un input. |
| `/super-admin/dashboard` | Depende de `getNegocios` + `getRenewalRequests` sin demo; métricas derivadas en el componente. |
| `/super-admin/usuarios` `/planes` `/facturacion` `/logs` `/configuracion` | Módulos superficiales (facturación tiene 24 líneas: es un placeholder). Los planes duplican los precios hardcodeados de negocios. |

### Admin
| Vista | Hallazgos |
|---|---|
| Dashboard | Denso pero funcional. Hero con gradiente + "mac-dots" (decoración de ventana macOS que no significa nada en un CRM); "Next steps" estático (no refleja el estado real del negocio); tarjetas KPI duplican datos del hero ("Ingresos hoy" aparece 2 veces); en móvil los montos grandes parten mal ("$ 36.500.\|000") y la tabla Caja queda cortada sin indicador de scroll. |
| Agenda | La vista más importante y la más cargada (390 líneas): Board/Lista/Calendario en tabs propios, filtros por fecha con flechas ←→ diminutas, botón "Agendar" por cita ambiguo (¿agenda o confirma?). Crear cita abre formulario largo en vez de un flujo de 3 pasos. |
| Turnos | Cada cita pendiente repite el formulario completo de cierre (precio, propina, pago, descuento, anticipo) inline → páginas kilométricas con 10+ citas. El arqueo por método de pago está bien resuelto. |
| Gastos | Correcto y simple. Filtros por categoría como chips: buen patrón, único lugar donde se usa. |
| Inventario | Kardex + alertas bien planteados. El selector de insumo es un `<select>` nativo que no escala con 200 productos. |
| Servicios / Empleados / Clientes | Tablas sin ordenamiento, sin paginación, sin acciones en lote. "Historial" y "Editar" como links de texto pequeños. Cada módulo tiene su propio Modal (`ServicioModal`, `EmpleadoModal`, `ClienteModal`, `GastoModal`, `InventarioModal` — 5 modales que son el mismo patrón). |
| Reportes | El más completo (KPIs, rentabilidad por servicio/empleado, export CSV). Drag-and-drop para reordenar módulos: complejidad innecesaria. PDF es botón sin implementación real. |
| Configuración | **Crashea en demo** (§1.2). Mezcla identidad visual, fidelización y plantillas WhatsApp en una página de scroll infinito. |
| Marketing | Catálogo de upsells de OperUX. Bien como concepto de monetización; visualmente otro muro de tarjetas. |

### Empleado
Todo el módulo **crashea en modo demo** (`lib/empleado/queries.ts`: 0 checks de demo). Por código: mi-agenda y cerrar-turno duplican la lógica de cierre de turnos del admin.

### Cliente
| Vista | Hallazgos |
|---|---|
| `/cliente/reservar` | Flujo correcto (servicio → especialista → fecha → slots) pero requiere "Consultar slots" manual en vez de cargar disponibilidad al elegir; los productos al final distraen. |
| `/cliente/mis-citas` | Funcional. Reprogramar/cancelar accesibles. Bien. |
| `/r/[slug]` | Registro público con puntos: simple y efectivo. La mejor pantalla del producto en relación señal/ruido. |

---

## 3. Lista priorizada de problemas (con impacto, riesgo, solución y beneficio)

**P0 = bloquea venta/operación · P1 = degrada seriamente · P2 = calidad · P3 = pulido**

| # | Prob. | Problema | Impacto | Riesgo si no se corrige | Solución propuesta | Beneficio |
|---|---|---|---|---|---|---|
| 1 | P0 | Módulos super-admin, empleado y configuración crashean en demo; demo roto en producción (middleware vs sesión) | No se puede demostrar ni operar el producto | Pérdida de todas las demos comerciales | Capa de datos única con interfaz `DataSource` (real/demo) y una sola función `isDemoActive()` compartida por middleware y sesión | Demo confiable = herramienta de venta |
| 2 | P0 | `createNegocio` falla sin feedback (service key, Zod, slug duplicado, email duplicado) | El flujo de alta de clientes no funciona | No se pueden dar de alta clientes pagos | Migrar a `useFormState` + `safeParse` + errores por campo; validar slug en cliente; autogenerar slug desde nombre; verificación de env vars al arrancar | Alta de negocios en <2 min sin soporte |
| 3 | P0 | Bot de ayuda `z-index:9999` tapa cerrar sesión/perfil/menú en móvil; footer-firma se solapa | App inutilizable en móvil (el 70%+ del uso en barberías es móvil) | Abandono de usuarios operativos | Escala de z-index tokenizada (dropdown 30 < sticky 40 < drawer 50 < modal 60 < toast 70); bot como FAB que respeta safe-areas y se oculta con drawers abiertos; footer de una línea sin canvas | Operación móvil fluida |
| 4 | P0 | Checkbox propina→comisión siempre `true` (`z.coerce.boolean("false")`) | Comisiones mal liquidadas | Pérdidas económicas reales para clientes | `z.preprocess(v => v === "true", z.boolean())` o leer `formData.getAll().at(-1)` | Liquidación correcta |
| 5 | P1 | Onboarding inexistente: formulario de 20 campos + admin sin guía | Configurar un negocio toma horas y soporte manual | No escala la operación comercial | Wizard de 3 pasos (§7) + checklist de activación en el dashboard del admin | Time-to-value de días a minutos |
| 6 | P1 | Identidad visual "IA" (violeta/neón/mascota/gradientes) | Percepción de producto amateur | Rechazo en ventas B2B | Design System nuevo (§8): neutros, un primario, densidad alta | Percepción premium |
| 7 | P1 | Sin componentes compartidos: 11 definiciones de `input`, 5 modales duplicados, 59 usos de `rounded-[2rem]` | Cada cambio visual toca decenas de archivos | Inconsistencia crónica, velocidad de desarrollo en caída | Librería `components/ui` completa (§12) | Cambios globales en un solo lugar |
| 8 | P1 | Tablas sin ordenar/paginar/buscar server-side; formularios de cierre repetidos inline en Turnos | Lentitud operativa con datos reales (500+ clientes) | Degradación progresiva | `DataTable` genérico + cierre de turno en drawer lateral | Velocidad de caja |
| 9 | P1 | Passwords iniciales en texto plano escritos por super admin | Riesgo de seguridad y fricción | Incidente de seguridad | Invitaciones por email + `mustChangePassword` (ya existe) | Seguridad y menos fricción |
| 10 | P2 | 3 canvases con `requestAnimationFrame` permanente (NeuralCanvas pantalla completa, firma, cursor glow) + framer-motion en cada navegación | CPU/batería en móviles de gama media; jank | Percepción de lentitud | Eliminar canvases decorativos; transiciones CSS de 150 ms | Fluidez perceptible |
| 11 | P2 | MRR y precios de planes hardcodeados en JSX (2 lugares distintos) | Datos falsos en el panel de control | Decisiones sobre números inventados | Tabla `planes` en BD como única fuente | Métricas confiables |
| 12 | P2 | Roles binarios (4 roles fijos), sin permisos granulares; no hay rol "caja/recepcionista" | No se adapta a negocios con recepcionista | Pérdida de segmento de mercado | Matriz permiso-por-módulo en BD (fase 2 del roadmap) | Vendible a locales más grandes |
| 13 | P2 | Rate limiter de login en memoria (inútil en serverless, documentado en el propio código) | Protección ficticia | Fuerza bruta viable | Upstash Redis o tabla `rate_limits` en Supabase | Seguridad real |
| 14 | P3 | Breadcrumb + título + identidad repetidos en header; buscador del sidebar que solo filtra 11 labels | Ruido visual | — | Header de una línea; búsqueda global (cmd+k) en fase posterior | Claridad |
| 15 | P3 | Textos con errores/ inconsistencias ("Configuracion" sin tilde, "unas" por "uñas" en datos, "BarberLab" vs "Operux" mezclados) | Percepción de descuido | — | Pasada de copy + constante de marca única | Consistencia |

---

## 4. Cambios visuales (Fase Color + Diseño)

**Eliminar por completo:**
- Tema oscuro como único tema; violetas/cianes neón; gradientes en botones y heros; `mac-dots`; canvas de partículas (fondo, firma, cursor); mascota Maylo como elemento flotante permanente; sombras `shadow-2xl shadow-violet-950/*`; `rounded-[2rem]` y `rounded-3xl` en contenedores de trabajo.

**Nueva dirección — "software empresarial premium" (referencias: Linear para densidad y jerarquía, Stripe Dashboard para tablas y color, Square/Toast POS para caja en móvil):**

```
Fondo app:        #F8F9FB (gris casi blanco)    Superficie: #FFFFFF
Borde:            #E5E7EB                        Borde fuerte: #D1D5DB
Texto primario:   #111827   Texto secundario: #6B7280   Deshabilitado: #9CA3AF
Primario (único): #2563EB (azul 600) — hover #1D4ED8, tinte #EFF6FF
Éxito:            #16A34A / tinte #F0FDF4
Alerta:           #D97706 / tinte #FFFBEB
Error:            #DC2626 / tinte #FEF2F2
```
- El branding por negocio (colorPrimario/Secundario/Acento de `negocios`) se reduce a **un solo acento** aplicado a logo, avatar y elementos de marca del negocio — nunca al chrome de la app.
- Tipografía: **Inter** única (ya auto-hospedada), escala 12/13/14/16/20/24, `tabular-nums` para todos los montos.
- Espaciado: escala de 4 px. Radios: 6 px (controles), 10 px (tarjetas/modales). Sombras: solo 2 niveles (sm para cards, lg para overlays).
- Alturas fijas: botones e inputs 36 px (32 px en tablas densas), filas de tabla 44 px.
- Estados obligatorios en todos los controles: hover, focus visible (`ring-2` azul), disabled, loading. Skeletons ya existen (`SkeletonCard`) — extender a tablas.

## 5. Cambios funcionales

1. Alta de negocio con wizard + errores por campo + slug autogenerado + invitación al admin por email.
2. Checklist de activación en dashboard del admin (reemplaza el "Next steps" estático): Servicios ✓ → Empleados ✓ → Horarios ✓ → Listo para agenda; cada ítem enlaza y se marca solo.
3. Cierre de turno en drawer lateral (lista compacta de citas realizadas → clic → drawer con foco en precio/pago), tanto admin como empleado, compartiendo componente.
4. Disponibilidad de reserva cargada automáticamente al elegir servicio+especialista (eliminar botón "Consultar slots").
5. Errores y confirmaciones con un sistema de toasts único (hoy `SubmitToast` cubre solo una parte).
6. Recuperación de contraseña real (Supabase `resetPasswordForEmail`).
7. Facturación super-admin conectada a datos reales (hoy es placeholder) — o retirarla del menú hasta que exista.

## 6. Cambios técnicos

1. **Unificar la semántica del modo demo**: una sola función que consideren middleware, sesión y queries; queries demo para super-admin y empleado (o interfaz `DataSource` con implementación mock completa).
2. **Server Actions con contrato de resultado**: `type ActionResult = { ok: true } | { ok: false; fieldErrors?: …; message?: string }` + `useFormState` en todos los formularios. Eliminar todos los `.parse()` a favor de `.safeParse()`.
3. Arreglar `z.coerce.boolean` (afecta `propinaEnComision` y cualquier otro checkbox con hidden false).
4. Chequeo de env vars al boot (`lib/env.ts` con Zod): falla el build si falta `SUPABASE_SERVICE_ROLE_KEY` en vez de fallar en runtime al crear un negocio.
5. Sacar `getNegocioById` de la dependencia de `/admin/configuracion` (query propia del módulo admin).
6. Extraer de `AppChrome.tsx` (849 líneas): `helpTopics` a `lib/content/help.ts`, alertas a componente, perfil a componente. Objetivo <250 líneas.
7. Rate limiting con almacenamiento compartido.
8. Cookies de rol demo e impersonación (`barberlab_sa_imp`): firmarlas o migrar a session storage server-side.
9. Paginación server-side en clientes/gastos/logs.
10. Quitar `dynamic = "force-dynamic"` donde el dato lo permita; `revalidatePath` ya se usa bien (160 llamadas).

## 7. Flujos rediseñados (pasos que sobran / faltan)

| Flujo | Hoy | Propuesta |
|---|---|---|
| Crear negocio (SA) | 1 formulario, 20+ campos, sin feedback | Paso 1: nombre + slug autogenerado + plan. Paso 2: email del admin → invitación. Paso 3 (opcional, difierible): branding y regla contable con defaults. 3 campos obligatorios en total. |
| Onboarding admin | Inexistente | Checklist de activación autoverificable en dashboard. |
| Crear cliente | Modal completo | Creación rápida inline (nombre + teléfono) desde agenda y desde clientes; ficha completa después. |
| Crear venta/cerrar caja | Formulario repetido inline por cita | Drawer de cierre con precio prellenado del servicio, método de pago con botones grandes (patrón POS), propina opcional colapsada. 3 taps en el caso feliz. |
| Abrir/cerrar caja (arqueo) | No existe apertura de caja; solo arqueo del día | Añadir apertura/cierre de caja diario con conteo inicial/final (requisito estándar de POS). |
| Reservar (cliente) | 4 selects + botón consultar + botón reservar | Selección progresiva con slots inmediatos; confirmación en un tap. |
| Crear usuario | SA escribe password | Invitación por email, rol y negocio preasignados. |
| Reportes | Completo pero con drag-and-drop innecesario | Orden fijo curado; export CSV se mantiene; PDF se elimina hasta implementarse. |
| Mesas | **No existe módulo de mesas** (el brief lo menciona): los negocios actuales son barberías/spa. Si el roadmap incluye verticales con mesas (`lib/verticales.ts` ya define verticales), diseñarlo como módulo opcional por vertical en fase 3. |

## 8. Propuesta de Design System (resumen operativo)

- **Tokens** en `tailwind.config.ts` + CSS vars (`--color-primary`, `--radius-control`, `--h-control`…), tema claro por defecto, oscuro opcional después.
- **Componentes nuevos necesarios** (`components/ui`): `Button` (primary/secondary/ghost/danger, sm/md), `Input`, `Select`, `Textarea`, `Checkbox`, `RadioGroup`, `Field` (label+error+hint), `DataTable` (sort, paginación, empty state), `Drawer`, `Dialog` (unifica los 5 modales), `Toast`, `Badge`, `Tabs`, `EmptyState`, `Stat` (KPI), `PageHeader` (título+acciones+breadcrumb), `SearchInput`, `DatePicker` ligero.
- **Componentes a eliminar**: `NeuralCanvas`, `CursorGlow`, `AnimatedGrid`, `MrzSignature` (reemplazado por footer de texto de una línea), `PageTransition` (framer-motion), `KpiCounter` animado (número directo con `tabular-nums`), heros decorativos con `mac-dots` de cada página, sección "Capacidades SaaS" de negocios, MRR hardcodeado. `MrzHelpBot` se rediseña como botón "?" en el header que abre un panel de ayuda (sin mascota fija, sin z-index 9999).
- **Navegación recomendada**: sidebar iconográfico neutro (sin círculo de color por ítem), agrupado en Operación (Dashboard, Agenda, Caja) / Catálogo (Servicios, Inventario) / Personas (Clientes, Empleados) / Análisis (Reportes) / Sistema (Configuración, Marketing). En móvil: bottom tab bar fija con 4 destinos + "Más", en vez del tab bar horizontal superior con scroll.

## 9. Roadmap por fases

**Fase 0 — Hotfixes (1-2 días)** · riesgo bajo, no toca diseño
0.1 Corregir `z.coerce.boolean` (propina/comisión). 0.2 Unificar `isDemoMode` middleware+sesión. 0.3 Demo queries para super-admin/empleado/configuración (o deshabilitar esos roles en demo con mensaje claro). 0.4 `useFormState` + `safeParse` en `createNegocio` con errores visibles + slug autogenerado. 0.5 Validar env vars al boot. 0.6 Bot: quitar `zIndex:9999`, ocultarlo con drawer abierto. 0.7 Footer móvil de una línea. 0.8 Revisar `SUPABASE_SERVICE_ROLE_KEY` en Vercel y desactivar Deployment Protection si la URL debe ser pública.
*Verificación: crear negocio end-to-end en staging; recorrido móvil 375px de los 4 roles.*

**Fase 1 — Design System base (3-5 días)**
Tokens + tema claro + `Button/Input/Field/Dialog/Drawer/Toast/DataTable/PageHeader/EmptyState`. Eliminar canvases y decoración. Login rediseñado (primera impresión).

**Fase 2 — Migración de pantallas (5-8 días)**
Orden: Login → Dashboard → Agenda → Turnos (drawer de cierre) → Clientes/Empleados/Servicios (DataTable) → Inventario/Gastos → Reportes → Configuración (separada en tabs: Negocio / Marca / Fidelización / WhatsApp) → Super Admin (wizard de alta + detalle). Una PR por pantalla, sin cambios de comportamiento no listados.

**Fase 3 — Flujos y onboarding (3-5 días)**
Wizard de negocio, invitaciones por email, checklist de activación, reserva con slots automáticos, apertura/cierre de caja.

**Fase 4 — Responsive y accesibilidad (2-3 días)**
Bottom tabs móvil, safe-areas, teclado móvil (inputs numéricos con `inputmode`), tablas → cards en <640px, focus visible global, contraste AA, `aria-label` en iconos.

**Fase 5 — Performance y escalabilidad (2-4 días)**
Paginación server-side, quitar framer-motion, revisar bundle de recharts (import dinámico), permisos granulares (matriz por módulo), rate limiting real, facturación SA real o retirada.

**Fase 6 — Núcleo ERP (2-3 semanas)**
El producto deja de ser solo CRM y se convierte en el sistema de gestión completo del negocio:
6.1 **Compras y proveedores**: tabla `proveedores` + `ordenes_compra`; una compra recibida genera automáticamente el movimiento de entrada en el kardex (`mov_inventario`) con costo promedio ponderado. Hoy las entradas se registran a mano sin origen.
6.2 **Stock reservado**: concepto tomado directamente del modelo Shopee (`reserved_stock`): una cita confirmada reserva los insumos de su servicio y una venta de producto pendiente reserva unidades; el stock disponible = físico − reservado. Cancelar la cita/venta libera la reserva (equivalente a `place_order`/`cancel_order` de Shopee).
6.3 **Venta de productos (POS)**: los productos del inventario se pueden vender directamente en caja (hoy solo se consultan); ticket mixto servicio+productos en el mismo cierre de turno.
6.4 **Caja formal**: sesiones de apertura/cierre con conteo inicial/final y diferencias (ya listado en Fase 3, aquí se conecta contablemente).
6.5 **Multi-sede**: un `negocio` puede tener N `sedes`; stock, caja, empleados y agenda por sede; reportes consolidados y por sede. (Cambio de esquema aditivo: tabla `sedes` + columna `sede_id` nullable en las tablas operativas.)
6.6 **Cuentas por pagar/cobrar** básicas: gastos con proveedor y vencimiento; anticipos de clientes (ya existen depósitos de tatuajes — generalizarlos).

**Fase 7 — Mecanismo de Push e integraciones (1-2 semanas)**
Arquitectura de eventos calcada del Push Mechanism de Shopee Open Platform (referencia: `open.shopee.com/push-mechanism`), en dos direcciones:

*Outbound — Operux como plataforma (otros sistemas se suscriben a nuestros eventos):*
- **Patrón outbox**: tabla `eventos` (`event_id` uuid, `code` numérico por tipo de evento, `negocio_id`, `payload` jsonb, `timestamp`) escrita **en la misma transacción** que la mutación de negocio. Ningún evento se emite fuera de transacción (garantía de consistencia).
- Tabla `webhook_suscripciones`: `url`, `secret`, `codes[]`, `activo`, contadores de fallos.
- **Formato del mensaje** (idéntico en espíritu al de Shopee): `{ "data": { …, "changed_values": [{"name":"stock","old":10,"new":8}], "action": "…" }, "negocio_id": …, "code": 8, "timestamp": … }` — siempre con `old`/`new` para que el consumidor pueda reconciliar sin pedir el estado completo.
- **Entrega**: POST JSON con firma HMAC-SHA256 en header (`X-Operux-Signature`), timeout **3 s**; reintentos con el mismo backoff de Shopee: **300 s → 1800 s → 10800 s**; sin garantía de orden y con posibles duplicados documentados (el consumidor deduplica por `event_id`). Tras agotar reintentos, evento a estado `dead` visible en un panel de entregas con re-envío manual.
- Runtime en Vercel: worker de entregas disparado por Vercel Cron (cada minuto) sobre la cola en Postgres; sin infraestructura nueva.
- **Catálogo inicial de eventos** (code): 1 `cita_creada`, 2 `cita_estado_cambiado`, 3 `turno_cerrado`, 4 `stock_cambiado`, 5 `stock_reservado_cambiado`, 6 `stock_bajo_minimo`, 7 `cliente_creado`, 8 `gasto_registrado`, 9 `negocio_estado_cambiado` (suspensión/reactivación, para integraciones de facturación del super admin).

*Inbound — Operux como consumidor (sincronización con canales de venta):*
- Endpoint `/api/webhooks/[canal]` con verificación de firma, respuesta 200 inmediata (<3 s) y procesamiento asíncrono (misma cola).
- Primer adaptador: **Shopee** para negocios que venden productos online — consumir `order_status_push` y `reserved_stock_change_push` para descontar/liberar stock del inventario Operux automáticamente. El diseño de la Fase 6.2 (stock reservado) hace que este mapeo sea 1:1.
- Los "Configurar" del módulo Marketing (WhatsApp, campañas) se montan sobre esta misma cola de eventos (ej.: evento `cita_creada` → recordatorio WhatsApp), en lugar de lógica ad-hoc por integración.

Cada fase termina con: `npm run typecheck`, recorrido de humo de los 4 roles en demo, y captura móvil+desktop de las pantallas tocadas. Compatibilidad: no se cambia el esquema de BD salvo adiciones (tabla `planes`, permisos, y las tablas ERP de las fases 6-7: `proveedores`, `ordenes_compra`, `sedes`, `eventos`, `webhook_suscripciones`); las Server Actions mantienen sus firmas mientras se migra formulario por formulario.

---

## Apéndice — Evidencia

- Crash super-admin demo: `.audit-shots/sa-negocios-desktop.png`
- Crash configuración demo: `.audit-shots/admin-config.png`
- Solapamiento firma/bot móvil: `.audit-shots/mobile-dash-bottom.png`
- Título sobre botón X en drawer móvil: `.audit-shots/mobile-menu-open.png`
- Look "IA" actual: `.audit-shots/desktop-dashboard.png`, `mobile-sidebar-top.png` (login)
- Código: `app/super-admin/negocios/actions.ts` (createNegocio), `lib/auth/session.ts` + `middleware.ts` (demo inconsistente), `components/layout/MrzHelpBot.tsx:460` (z-index 9999), `components/layout/MrzSignature.tsx` (footer), `lib/validations/admin.ts:102` (coerce.boolean)
