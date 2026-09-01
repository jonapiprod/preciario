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
   (cada 4 horas llama a `/api/ingest`, que recorre todos los adaptadores
   activos y actualiza precios + genera alertas de error de precio).

## Notas legales

- Este proyecto usa APIs oficiales / feeds de afiliados, no scraping directo
  de las webs de las tiendas — respeta sus condiciones de uso.
- Cada red de afiliados exige mostrar un aviso de afiliación visible (ya
  incluido en el footer) y, en algunos casos, formato específico de enlaces.
  Revisa las condiciones concretas de cada programa antes de publicar la web.
