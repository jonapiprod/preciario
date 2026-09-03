# ChollosTech — Puesta en marcha

## Estado actual

La web funciona ya de extremo a extremo (búsqueda, filtro por categoría y
tienda, comparador de precios, detector de errores de precio) con **datos de
ejemplo** generados por `MockAdapter` (`src/lib/adapters/mockAdapter.ts`).
Nada de esto son precios reales todavía.

## Arrancar en local

```bash
npm install
npx prisma dev -d          # levanta una base Postgres local gestionada por Prisma
npx prisma db push         # crea las tablas
npm run db:seed            # datos de ejemplo + un par de "errores de precio" forzados
npm run dev                # http://localhost:3000
```

`npx prisma dev` sustituye a tener Postgres/Docker instalado: gestiona un
servidor Postgres local él mismo. Para producción, cambia `DATABASE_URL` en
`.env` por una base de Neon o Supabase (plan gratuito) y ejecuta
`npx prisma db push` contra ella.

## Cómo pasar de datos de ejemplo a precios reales

La arquitectura ya está lista para esto (ver `src/lib/adapters/registry.ts`),
pero requiere que **tú mismo** obtengas acceso a las fuentes de datos, ya
que piden identidad y datos fiscales tuyos:

1. **Amazon Asociados** (afiliados de Amazon.es):
   - Crea una cuenta en [afiliados.amazon.es](https://afiliados.amazon.es/).
   - Para tener acceso a la API (PA-API 5.0) necesitas haber generado alguna
     venta cualificada en los últimos 180 días — al principio solo puedes
     generar enlaces manualmente.
   - Cuando tengas `Access Key`, `Secret Key` y `Partner Tag`, añádelos a
     `.env` (ver `.env.example`). El adaptador ya está implementado en
     `src/lib/adapters/amazonPaapiAdapter.ts`; actívalo añadiéndolo en
     `registry.ts`.

2. **Redes de afiliación para el resto de tiendas** (PcComponentes,
   MediaMarkt, El Corte Inglés, Fnac, Carrefour, Coolmod): en España casi
   todas trabajan a través de redes como **Awin** o **TradeDoubler**.
   - Crea una cuenta de "publisher" en [awin.com](https://www.awin.com/es) o
     [tradedoubler.com](https://www.tradedoubler.com/).
   - Solicita unirte al programa de cada tienda (cada una aprueba de forma
     manual, puede tardar días).
   - Una vez aprobado, cada red te da un feed de producto descargable
     (CSV/XML, actualizado a diario) con precio, EAN, categoría, etc.

3. **Pásame una fila de ejemplo de un feed real** (con las cabeceras) y
   termino de ajustar `columnMap` en `createCsvFeedAdapter`
   (`src/lib/adapters/csvFeedAdapter.ts`) al formato exacto de esa tienda.
   Después solo hay que instanciarlo en `registry.ts`:

   ```ts
   createCsvFeedAdapter({
     storeSlug: "pccomponentes",
     storeName: "PcComponentes",
     affiliateNetwork: "AWIN",
     feedUrl: "https://...",
     columnMap: { title: "product_name", price: "search_price", /* ... */ },
   });
   ```

4. Despliega en Vercel y conecta el cron ya definido en `vercel.json`
   (una vez al día llama a `/api/ingest`, que recorre todos los adaptadores
   activos y actualiza precios + genera alertas de error de precio).

## Desplegar a producción (Vercel + Neon)

Ninguno de estos pasos los puedo hacer yo por ti: requieren que crees tus
propias cuentas (piden email/OAuth y aceptar condiciones). Una vez hechos,
puedo ayudarte con la parte de comandos (push, migraciones, etc.).

1. **Base de datos: Neon** — [neon.com](https://neon.com), crea un proyecto
   gratis y copia el "connection string" (`postgres://...`). También puedes
   crearla directamente desde Vercel (paso 3, pestaña *Storage*), que la
   integra automáticamente sin copiar nada a mano.

2. **Sube el código a GitHub** — crea un repositorio vacío en
   [github.com/new](https://github.com/new) y avísame del nombre/URL; yo
   añado el remoto y hago el push del commit que ya tenemos.

3. **Importa el proyecto en Vercel** — [vercel.com/new](https://vercel.com/new),
   importa el repo de GitHub. En *Environment Variables* añade:
   - `DATABASE_URL` (de Neon, si no usaste la integración automática)
   - `PRICE_ERROR_DROP_THRESHOLD` = `0.6`
   - `CRON_SECRET` = un valor aleatorio (pídemelo y te genero uno)
   Pulsa *Deploy*.

4. **Crea las tablas en la base de datos de producción** — en local, con
   `DATABASE_URL` apuntando a Neon:
   ```bash
   npx prisma db push
   npm run db:seed   # opcional, para tener datos de ejemplo visibles ya
   ```

5. **Cron de ingesta** — ya configurado en `vercel.json` (una vez al día,
   límite del plan gratuito Hobby de Vercel; con plan Pro se puede bajar a
   cada minuto). Se activa solo al desplegar, no requiere nada más.

6. **Dominio propio (opcional)** — Vercel da uno `*.vercel.app` gratis;
   puedes añadir el tuyo en *Project Settings → Domains*.

## Cuentas de usuario, favoritos y alertas por Telegram

La web ya soporta registro/login (`/registro`, `/login`, también con
Google), marcar productos y categorías como favoritos, y avisos de bajada
de precio por Telegram para lo que tengas en favoritos.

1. **`SESSION_SECRET`** — necesaria para que funcione el login. Genera un
   valor aleatorio (`openssl rand -hex 32`) y añádelo en Vercel igual que
   `CRON_SECRET`. No lo cambies una vez en producción: invalidaría la
   sesión de todos los usuarios registrados.

2. **Login con Google** (opcional) — en
   [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials):
   - Crea un proyecto si no tienes uno, y un **OAuth client ID** de tipo
     *Aplicación web*.
   - En *Authorized redirect URIs* añade **ambas**:
     `http://localhost:3000/api/auth/google/callback` (para probar en
     local) y `https://<tu-dominio>/api/auth/google/callback`
     (producción).
   - Te da un **Client ID** y un **Client Secret** — pásamelos y los pongo
     como `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` en Vercel (y en tu
     `.env` local si quieres probarlo ahí).

3. **Crear el bot de Telegram** (opcional, solo si quieres las alertas):
   - Abre Telegram, busca **@BotFather** y envíale `/newbot`.
   - Sigue las instrucciones (nombre del bot, nombre de usuario terminado
     en `bot`). Te dará un **token** — pásamelo y me encargo del resto.
   - Añade `TELEGRAM_BOT_TOKEN` (el token) y `TELEGRAM_WEBHOOK_SECRET` (un
     valor aleatorio, te lo genero yo) en Vercel.

4. **Registrar el webhook** — una vez desplegado con esas variables, hay
   que decirle a Telegram dónde mandar los mensajes que reciba el bot
   (ejecútalo tú o dímelo y lo hago yo con el token):
   ```bash
   curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<tu-dominio>/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
   ```

5. **Vincular Telegram** — cada usuario, desde `/perfil`, genera un código
   y se lo envía al bot como `/start <código>` desde su propio Telegram
   para empezar a recibir avisos.

Sin `TELEGRAM_BOT_TOKEN` configurado, la web funciona igual (registro,
login, favoritos) pero no se envía ningún mensaje — el envío se salta en
silencio.

## Notas legales

- Este proyecto usa APIs oficiales / feeds de afiliados, no scraping directo
  de las webs de las tiendas — respeta sus condiciones de uso.
- Cada red de afiliados exige mostrar un aviso de afiliación visible (ya
  incluido en el footer) y, en algunos casos, formato específico de enlaces.
  Revisa las condiciones concretas de cada programa antes de publicar la web.
